type AnyFunction = (...args: never[]) => unknown;

export const throttle = <Callback extends AnyFunction>(
  callback: Callback,
  delay: number,
) => {
  let lastCallTime = 0;

  return ((...args: Parameters<Callback>) => {
    const now = Date.now();

    if (now - lastCallTime < delay) {
      return;
    }

    lastCallTime = now;
    return callback(...args);
  }) as (...args: Parameters<Callback>) => ReturnType<Callback> | undefined;
};
