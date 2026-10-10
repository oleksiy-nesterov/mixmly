export const getExpressionResult = (
  firstNumber: number,
  secondNumber: number,
  operation: string,
) => {
  switch (operation) {
    case '+':
      return firstNumber + secondNumber;
    case '-':
      return firstNumber - secondNumber;
    case '*':
      return firstNumber * secondNumber;
    case '/':
      return secondNumber === 0 ? null : firstNumber / secondNumber;
  }
};

export const isExpressionCorrect = (exp: string): boolean => {
  const m = exp.match(
    /^\s*(?:(\d+)([+\-*/])(\d+)=(\d+)|(\d+)=(\d+)([+\-*/])(\d+))\s*$/,
  );

  if (!m) return false;

  const calc = (a: string, op: string, b: string) =>
    op === '+'
      ? +a + +b
      : op === '-'
        ? +a - +b
        : op === '*'
          ? +a * +b
          : +b !== 0
            ? +a / +b
            : NaN;

  return m[1]
    ? calc(m[1], m[2], m[3]) === +m[4]
    : +m[5] === calc(m[6], m[7], m[8]);
};
