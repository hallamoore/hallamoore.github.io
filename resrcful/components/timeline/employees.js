import { Element } from "../../element.js";

const getInitials = (name) => {
  const parts = name?.split(/\s/) || [];
  if (parts.length === 0) {
    return "";
  }
  if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }
  return `${parts[0][0]}${parts.at(-1)[0]}`.toUpperCase();
};

// Returns values between 255/2 and 255 to make sure colors are light enough for black font to stand
// out against. (unless name can't be parsed, then 0)
const getSingleChannelColor = (name) => (parseInt(name, 36) % (255 / 2)) + 255 / 2 || 0;

const getRGBColor = (name) => {
  return `rgb(${getSingleChannelColor(name)}, ${getSingleChannelColor(
    name?.slice(1)
  )}, ${getSingleChannelColor(name?.slice(2))})`;
};

class Avatar extends Element {
  static tag = "div";
  static className = "avatar";

  constructor({ employee, textContent, style, ...rest }) {
    const backgroundColor = employee?.color || getRGBColor(employee?.name);
    super({
      textContent: textContent || getInitials(employee?.name),
      title: textContent || employee?.name,
      style: { backgroundColor, ...style },
      ...rest,
    });

    this.employee = employee;
  }
}

export default class Employees extends Element {
  static tag = "div";
  static className = "employees";

  constructor({ employees, ...rest }) {
    super(rest);

    this.avatars = [];
    employees.forEach((employee) => {
      const avatar = new Avatar({ employee });
      this.avatars.push(avatar);
      this.appendChild(avatar);
    });

    this.overflowCounter = new Avatar({ style: { backgroundColor: "white" } });
    this.overflowCounter.hide();
    this.appendChild(this.overflowCounter);
  }

  fitToMinWidth() {
    if (this.avatars.length <= 3) {
      this.overflowCounter.hide();
      this.avatars.forEach((av) => av.show());
    } else {
      this.avatars.forEach((av) => av.hide());
      this.avatars[0].show();
      this.avatars[1].show();
      this.showOverflowCounter(2);
    }
  }

  fitToWidth() {
    this.overflowCounter.hide();

    let i = this.avatars.length - 1;
    while (this.hasOverflowX() && i >= 0) {
      this.avatars[i].hide();
      i--;
    }
    i = 0;
    while (!this.hasOverflowX() && i < this.avatars.length) {
      this.avatars[i].show();
      i++;
    }

    if (this.hasOverflowX()) {
      // Showing the last one put us over the edge. Hide that one. Replace the one before it with
      // the overflowCounter.
      this.avatars[i - 1].hide();
      this.avatars[i - 2].hide();
      this.showOverflowCounter(i - 2);
    }
  }

  showOverflowCounter(numAvatarsVisible) {
    const numRemaining = this.avatars.length - numAvatarsVisible;
    if (numRemaining === 0) return;
    this.overflowCounter.textContent = `+${numRemaining}`;
    this.overflowCounter.title = this.avatars
      .slice(numAvatarsVisible)
      .map((av) => av.employee.name)
      .join("\n");
    this.overflowCounter.show();
  }
}
