import { WeeklyDateTime } from "./datetime.js";

export class TimeRange {
  constructor(start, end) {
    this.start = start.copy();
    this.end = end.copy();
  }

  duration() {
    return this.end.subtract(this.start);
  }

  subtract(other) {
    if (this.start < other.start) {
      if (this.end <= other.start) {
        return [this];
      }
      if (this.end <= other.end) {
        return [new TimeRange(this.start, other.start)];
      }
      return [new TimeRange(this.start, other.start), new TimeRange(other.end, this.end)];
    }
    if (other.end <= this.start) {
      return [this];
    }
    if (other.end < this.end) {
      return [new TimeRange(other.end, this.end)];
    }
    return [];
  }

  union(other) {
    if (this.start < other.start) {
      if (this.end < other.start) {
        return [this, other];
      }
      if (this.end < other.end) {
        return [new TimeRange(this.start, other.end)];
      }
      return [this];
    }
    if (other.end < this.start) {
      return [other, this];
    }
    if (other.end < this.end) {
      return [new TimeRange(other.start, this.end)];
    }
    return [other];
  }

  intersection(other) {
    if (this.end <= other.start || this.start >= other.end) {
      return null;
    }
    const start = this.start > other.start ? this.start : other.start;
    const end = this.end < other.end ? this.end : other.end;
    return new TimeRange(start, end);
  }

  moveBy(arg) {
    this.start.increment(arg);
    this.end.increment(arg);
    return this;
  }
}

export class WeeklyTimeRange extends TimeRange {
  // time and day of week matters, but this class is date-agnostic
  constructor(start, end) {
    super(start, end);
    this.start = new WeeklyDateTime(start);
    this.end = new WeeklyDateTime(end);
  }

  endsBefore(date) {
    return this.end.isBefore(date);
  }

  startsAfter(date) {
    return this.start.isAfter(date);
  }

  toTimeRange(dateRef) {
    const start = this.start.resolve(dateRef);
    const end = this.end.resolve(dateRef);
    return new TimeRange(start, end);
  }

  intersection(other) {
    if (
      this.endsBefore(other.start) ||
      this.startsAfter(other.end) ||
      this.start.equals(other.end)
    ) {
      return null;
    }
    const thisAsTimeRange = this.toTimeRange(other.start);
    const start = thisAsTimeRange.start > other.start ? thisAsTimeRange.start : other.start;
    const end = thisAsTimeRange.end < other.end ? thisAsTimeRange.end : other.end;
    return new TimeRange(start, end);
  }
}
