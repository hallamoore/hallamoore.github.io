import { TimeRange } from "./timerange.js";

export class TimeRangeCollection extends Array {
  static fromSerialized(serialized) {
    return new TimeRangeCollection(...serialized.map(TimeRange.fromSerialized));
  }

  union(other) {
    let results = new TimeRangeCollection();
    let thisIndex = 0;
    let otherIndex = 0;
    while (thisIndex < this.length || otherIndex < other.length) {
      const thisTimeRange = this[thisIndex];
      const otherTimeRange = other[otherIndex];
      let earliest;
      if (thisTimeRange && (!otherTimeRange || thisTimeRange.start < otherTimeRange.start)) {
        earliest = thisTimeRange;
        thisIndex++;
      } else {
        earliest = otherTimeRange;
        otherIndex++;
      }
      if (results.length === 0) {
        results.push(earliest);
        continue;
      }

      const lastPushed = results.pop();
      results = results.concat(lastPushed.union(earliest));
    }
    return results;
  }

  subtract(other) {
    let otherIndex = 0;
    let results = new TimeRangeCollection();
    for (let thisTimeRange of this) {
      if (otherIndex >= other.length) {
        results.push(thisTimeRange);
        continue;
      }
      while (otherIndex < other.length) {
        const otherTimeRange = other[otherIndex];
        results = results.concat(thisTimeRange.subtract(otherTimeRange));
        if (thisTimeRange.end < otherTimeRange.end) {
          break; // continue to next thisTimeRange
        }
        otherIndex++;
        thisTimeRange = results.pop();
      }
    }
    return results;
  }

  intersection2(otherTimeRange, { keepValues = [] } = {}) {
    const results = new TimeRangeCollection();
    let fullFirstRange, fullLastRange;
    for (let thisTimeRange of this) {
      const next = thisTimeRange.intersection(otherTimeRange, { keepValues });
      if (!next && results.length > 0) {
        break;
      }
      if (next) {
        if (!fullFirstRange) {
          fullFirstRange = thisTimeRange;
        }
        fullLastRange = thisTimeRange;
        results.push(next);
      }
    }
    return { results, fullFirstRange, fullLastRange };
  }

  intersection(otherTimeRange, options) {
    return this.intersection2(otherTimeRange, options).results;
  }

  concat(other) {
    return new this.constructor(...this, ...other);
  }

  merge({ compFn, keepValues, ignoreTimeGaps = false }) {
    // Merges back-to-back ranges that have the same output from the
    // given comparison function (`compFn`)
    let results = new TimeRangeCollection();
    if (this.length === 0) {
      return results;
    }
    let last = this[0];
    this.forEach((range) => {
      if (compFn(last, range)) {
        let union = [];
        if (ignoreTimeGaps) {
          union = [new TimeRange(last.start, range.end)];
        } else {
          union = range.union(last);
        }
        union = union.map((x) => {
          keepValues.forEach((key) => {
            x[key] = range[key];
          });
          return x;
        });
        last = union.pop();
        results = results.concat(union);
      } else {
        results.push(last);
        last = range;
      }
    });
    results.push(last);
    return results;
  }
}

export class WeeklyTimeRangeCollection extends TimeRangeCollection {
  intersection(otherTimeRange) {
    // Returns a non-weekly TimeRangeCollection
    // not only are the time ranges weekly, but the array represents one week from sun midnight utc to next sun midnight utc
    let expandedCollection = new TimeRangeCollection(...this);
    const a = otherTimeRange.start.getStartOfWeek();
    const b = otherTimeRange.end.getEndOfWeek();
    const weekDiff = b.subtract(a).weeks;
    for (let i = 0; i < weekDiff - 1; i++) {
      expandedCollection = expandedCollection.concat(this);
    }
    return expandedCollection.intersection(otherTimeRange);
  }
}
