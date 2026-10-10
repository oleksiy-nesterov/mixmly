type AnyFunction = (...args: never[]) => unknown;

export const debounce = <Callback extends AnyFunction>(
  callback: Callback,
  delay: number,
) => {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return ((...args: Parameters<Callback>) => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      timer = null;
      callback(...args);
    }, delay);
  }) as (...args: Parameters<Callback>) => void;
};
