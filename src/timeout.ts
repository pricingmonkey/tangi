const wait = (timeInMillis: number): Promise<void> => {
  return new Promise<void>(resolve => setTimeout(() => resolve(), timeInMillis));
};

export const timeout = async <T>(promise: Promise<T>, timeoutInMs: number): Promise<T> => {
  if (timeoutInMs === undefined) {
    return promise;
  }
  return Promise.race([
    promise,
    wait(timeoutInMs).then(() => Promise.reject(new Error(`Timed out after ${timeoutInMs} ms`)))
  ]);
};
