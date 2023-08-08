export class TimeDelta {
  constructor(arg) {
    if (typeof arg === "number") {
      this.milliseconds = arg;
    } else {
      const {
        years = 0,
        weeks = 0,
        days = 0,
        hours = 0,
        minutes = 0,
        seconds = 0,
        milliseconds = 0,
      } = arg;
      this.milliseconds =
        milliseconds +
        1000 * (seconds + 60 * (minutes + 60 * (hours + 24 * (days + 7 * (weeks + 52 * years)))));
    }
  }

  valueOf() {
    return this.milliseconds;
  }

  get seconds() {
    return this.milliseconds / 1000;
  }

  get minutes() {
    return this.seconds / 60;
  }

  get hours() {
    return this.minutes / 60;
  }

  get days() {
    return this.hours / 24;
  }

  get weeks() {
    return this.days / 7;
  }
}
