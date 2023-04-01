export class TimeRangeCollection extends Array {
  // constructor(...args) {
  //   super(...args)
  // }

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

  intersection(otherTimeRange) {
    const results = new TimeRangeCollection();
    for (let thisTimeRange of this) {
      const next = thisTimeRange.intersection(otherTimeRange);
      if (!next && results.length > 0) {
        break;
      }
      if (next) {
        results.push(next);
      }
    }
    return results;
  }

  concat(other) {
    return new this.constructor(...this, ...other);
  }

  consolidate() {
    return this.length > 0 ? this.union([this[0]]) : new this.constructor();
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
