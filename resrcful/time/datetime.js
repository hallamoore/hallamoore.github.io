import { TimeDelta } from "./timedelta.js";

export class DateTime {
  constructor(timestamp) {
    this._jsDate = timestamp === undefined ? new Date() : new Date(timestamp);
  }

  static fromDateStr(dateStr) {
    // dateStr - YYYY-MM-DD
    // Returns midnight in the local timezone, not utc.
    const [year, month, day] = dateStr.split("-");
    return new DateTime().set({ year, month, day }).toStartOfDay();
  }

  valueOf() {
    return this._jsDate.valueOf();
  }

  copy() {
    return new DateTime(this.getTimestamp());
  }

  set({ year, month, day, hours, minutes, seconds, milliseconds }) {
    // Use `value != null` instead of `!value` or `value !== null` to make sure that the condition
    // is true for 0 and false for both null and undefined.
    if (year != null) this._jsDate.setFullYear(year);
    if (month != null) this._jsDate.setMonth(month - 1);
    if (day != null) this._jsDate.setDate(day);
    if (hours != null) this._jsDate.setHours(hours);
    if (minutes != null) this._jsDate.setMinutes(minutes);
    if (seconds != null) this._jsDate.setSeconds(seconds);
    if (milliseconds != null) this._jsDate.setMilliseconds(null);
    return this;
  }

  setTimeFrom(datetime) {
    const { _jsDate } = datetime;
    return this.set({
      hours: _jsDate.getHours(),
      minutes: _jsDate.getMinutes(),
      seconds: _jsDate.getSeconds(),
      milliseconds: _jsDate.getMilliseconds(),
    });
  }

  setHours(hours) {
    this._jsDate.setHours(hours);
    return this;
  }

  setDayOfWeek(dayOfWeek) {
    return this.increment({ days: dayOfWeek - this._jsDate.getDay() });
  }

  increment(arg) {
    if (!(arg instanceof TimeDelta)) {
      arg = new TimeDelta(arg);
    }
    this._jsDate.setTime(this._jsDate.getTime() + arg.milliseconds);
    return this;
  }

  decrement(arg) {
    if (!(arg instanceof TimeDelta)) {
      arg = new TimeDelta(arg);
    }
    this._jsDate.setTime(this._jsDate.getTime() - arg.milliseconds);
    return this;
  }

  toStartOfDay() {
    return this.set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
  }

  toEndOfDay() {
    return this.set({ hours: 24, minutes: 0, seconds: 0, milliseconds: 0 });
  }

  getTimestamp() {
    return this._jsDate.getTime();
  }

  getDateStr() {
    return this._jsDate.toISOString().split("T")[0];
  }

  getStartOfWeek() {
    const startOfWeek = this.copy();
    startOfWeek.toStartOfDay();
    startOfWeek._jsDate.setDate(startOfWeek._jsDate.getDate() - startOfWeek._jsDate.getDay());
    return startOfWeek;
  }

  getEndOfWeek() {
    const endOfWeek = this.copy();
    endOfWeek.toEndOfDay();
    const diff = 7 - endOfWeek._jsDate.getDay();
    endOfWeek._jsDate.setDate(endOfWeek._jsDate.getDate() + diff);
    return endOfWeek;
  }

  subtract(other) {
    return new TimeDelta(this._jsDate - other._jsDate);
  }

  getMonth() {
    return this._jsDate.getMonth() + 1;
  }

  getDayOfMonth() {
    return this._jsDate.getDate();
  }
}

export class WeeklyDateTime extends DateTime {
  resolve(dateRef) {
    return dateRef
      .getStartOfWeek()
      .setTimeFrom(this)
      .setDayOfWeek(this._jsDate.getDay());
  }

  isBefore(other) {
    return this.resolve(other) < other;
  }

  isAfter(other) {
    return this.resolve(other) > other;
  }

  equals(other) {
    return this.resolve(other).valueOf() == other.valueOf();
  }
}
