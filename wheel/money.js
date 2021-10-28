let currentPlayer = 1;
let currentMoneyPerLetter = 0;
const moneyByPlayerId = {};

function changePlayer(playerId) {
  currentPlayer = playerId;
  for (let node of document.querySelectorAll(".current-player")) {
    node.classList.remove("current-player");
  }
  document
    .querySelector(`#player${playerId}`)
    .parentElement.classList.add("current-player");
}

function nextPlayer() {
  let nextPlayerId = currentPlayer + 1;
  if (nextPlayerId == 4) {
    nextPlayerId = 1;
  }
  changePlayer(nextPlayerId);
}

function rewardMoney(numLettersRevealed) {
  moneyByPlayerId[currentPlayer].incrementBy(
    currentMoneyPerLetter * numLettersRevealed
  );
}

function deductVowelCost() {
  moneyByPlayerId[currentPlayer].incrementBy(-250);
}

class FlipDigit {
  constructor() {
    this.node = document.createElement("div");
    this.node.classList.add("flip-digit");

    for (let i = 0; i < 10; i++) {
      this.appendDigit(i);
    }
    // Add another 0 at the end to allow for smoother visuals when the flip animation wraps back
    // around to the beginning
    this.appendDigit(0);

    this._height = 0;
  }

  get height() {
    if (this._height) return this._height;
    this._height = this.node.clientHeight;
    return this._height;
  }

  appendDigit(i) {
    const digitElem = document.createElement("div");
    digitElem.classList.add("number-card");
    digitElem.innerText = i;
    this.node.appendChild(digitElem);
  }

  flipBy(delta) {
    const totalScrollBy = this.height * delta;
    const startOfSecond0 = this.height * 10;

    let finalScrollTop = this.node.scrollTop + totalScrollBy;
    while (finalScrollTop < 0) {
      finalScrollTop += this.height * 10;
    }
    finalScrollTop = finalScrollTop % (this.height * 10);

    const desiredDuration = 500;
    const durationBetweenIntervals = 100;
    const numIntervals = desiredDuration / durationBetweenIntervals;
    // Round to prevent weird float precision behavior
    const roundFn = delta > 0 ? Math.ceil : Math.floor;
    const scrollByPerInterval = roundFn(totalScrollBy / numIntervals);

    const scrollTopWrapCondition = delta > 0 ? startOfSecond0 : 0;
    const scrollToWhenWrapping = delta > 0 ? 0 : startOfSecond0;

    let scrolledSoFar = 0;
    const intervalId = setInterval(() => {
      this.node.scrollBy(0, scrollByPerInterval);
      scrolledSoFar += scrollByPerInterval;

      if (this.node.scrollTop === scrollTopWrapCondition) {
        this.node.scrollTo(0, scrollToWhenWrapping);
      }

      if (Math.abs(scrolledSoFar) >= Math.abs(totalScrollBy)) {
        // Adjust for any surplus scroll caused by scrollByPerInterval being rounded
        this.node.scrollTo(0, finalScrollTop);
        clearInterval(intervalId);
      }
    }, durationBetweenIntervals);
  }

  flipForwardTo(target) {
    let delta = target - this.value();
    if (delta < 0) {
      delta += 10;
    }
    this.flipBy(delta);
  }

  flipBackwardsTo(target) {
    let delta = this.value() - target;
    if (delta < 0) {
      delta += 10;
    }
    this.flipBy(-delta);
  }

  value() {
    // Mod 10 to account for if we're at the second 0. That should be considered 0, not 10.
    return (this.node.scrollTop / this.height) % 10;
  }
}

class Money {
  constructor(playerId) {
    this.node = document.createElement("div");
    this.node.classList.add("money");
    this.node.innerText = "$";
    document.querySelector(`#player${playerId}`).appendChild(this.node);

    this.flipDigits = [];
    this.prependFlipDigit();
  }

  prependFlipDigit() {
    const flipDigit = new FlipDigit();
    this.flipDigits.unshift(flipDigit);
    if (this.node.children.length === 0) {
      this.node.appendChild(flipDigit.node);
    } else {
      this.node.insertBefore(flipDigit.node, this.node.children[0]);
    }
    // Prevent scroll state on refresh
    flipDigit.node.scrollTo(0, 0);

    return flipDigit;
  }

  popFlipDigit() {
    const flipDigit = this.flipDigits.shift();
    flipDigit.node.remove();
  }

  value() {
    let value;
    for (let digit of this.flipDigits) {
      if (value == null) {
        value = digit.value();
      } else {
        value *= 10;
        value += digit.value();
      }
    }
    return value;
  }

  incrementBy(incr) {
    const previousValue = this.value();
    const nextValue = previousValue + incr;
    const nextValueDigits = nextValue
      .toString()
      .split("")
      .map(d => parseInt(d));
    const numDigitDiff =
      nextValueDigits.length - previousValue.toString().length;

    if (incr > 0) {
      for (let i = 0; i < numDigitDiff; i++) {
        this.prependFlipDigit();
      }
      for (let i = 0; i < nextValueDigits.length; i++) {
        this.flipDigits[i].flipForwardTo(nextValueDigits[i]);
      }
    } else {
      for (let i = numDigitDiff; i < 0; i++) {
        this.popFlipDigit();
      }

      for (let i = 0; i < nextValueDigits.length; i++) {
        this.flipDigits[i].flipBackwardsTo(nextValueDigits[i]);
      }
    }
  }
}
