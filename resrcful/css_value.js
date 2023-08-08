export class CSSValue {
  constructor(value, unit = "px") {
    this.value = value;
    this.unit = unit;
  }

  valueOf() {
    return this.value;
  }

  toString() {
    return `${this.value}${this.unit}`;
  }

  _calc(rightOperand, operator) {
    return new CSSCalcValue(this, rightOperand, operator);
  }

  add(rightOperand) {
    if (typeof rightOperand === "number" || rightOperand.unit === this.unit) {
      return new CSSValue(this + rightOperand, this.unit);
    }
    return this._calc(rightOperand, "+");
  }

  subtract(rightOperand) {
    if (typeof rightOperand === "number" || rightOperand.unit === this.unit) {
      return new CSSValue(this - rightOperand, this.unit);
    }
    return this._calc(rightOperand, "-");
  }

  multiply(rightOperand) {
    if (typeof rightOperand === "number" || rightOperand.unit === this.unit) {
      return new CSSValue(this * rightOperand, this.unit);
    }
    return this._calc(rightOperand, "*");
  }
}

const surroundWithParens = (input) => `(${input})`;

class Expression {
  constructor(leftOperand, rightOperand, operator) {
    this.leftOperand = leftOperand;
    this.rightOperand = rightOperand;
    this.operator = operator;
  }

  toString() {
    let result = "";

    result +=
      this.leftOperand instanceof Expression
        ? surroundWithParens(this.leftOperand)
        : this.leftOperand.toString();

    result += ` ${this.operator} `;

    result +=
      this.rightOperand instanceof Expression
        ? surroundWithParens(this.rightOperand)
        : this.rightOperand.toString();

    return result;
  }
}

class CSSCalcValue {
  constructor(leftOperand, rightOperand, operator) {
    if (leftOperand instanceof CSSCalcValue) {
      leftOperand = leftOperand.expression;
    }
    if (rightOperand instanceof CSSCalcValue) {
      rightOperand = rightOperand.expression;
    }
    this.expression = new Expression(leftOperand, rightOperand, operator);
  }

  toString() {
    return `calc(${this.expression})`;
  }

  multiply(rightOperand) {
    return new CSSCalcValue(this, rightOperand, "*");
  }
}
