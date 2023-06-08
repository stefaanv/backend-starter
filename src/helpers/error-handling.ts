export function ensureError<E = Error>(value: unknown): E {
  if (value instanceof Error) return value as E

  let stringified = '[Unable to stringify the thrown value]'
  try {
    stringified = JSON.stringify(value)
  } catch {}

  return new Error(stringified) as E
}

export type FailedTuple<E = Error> = [E, undefined]
export type SuccessTuple<T> = [null, T]
export type FailedOrSuccessTuple<T, E = Error> = FailedTuple<E> | SuccessTuple<T>
export type handleErrorFn<T, E = Error> = (error: E) => FailedOrSuccessTuple<T, E>
const processCatch = <T, E = Error>(e: unknown, handleError?: handleErrorFn<T, E>) => {
  if (handleError) return handleError(ensureError(e))
  return [ensureError(e), undefined] as FailedOrSuccessTuple<T, E>
}

export async function to<T, E = Error>(
  promise: Promise<T>,
  handleError?: handleErrorFn<T, E>,
): Promise<FailedOrSuccessTuple<T, E>> {
  return promise
    .then((result: T) => [null, result] as SuccessTuple<T>)
    .catch((e: unknown) => processCatch<T, E>(e, handleError))
}

export function toSync<T>(
  canThrow: () => T,
  handleError?: handleErrorFn<T>,
): [null | Error, T | undefined] {
  try {
    return [null, canThrow()]
  } catch (e: unknown) {
    if (handleError) return handleError(ensureError(e))
    return [ensureError(e), undefined]
  }
}

// Custom error example
// doen't forget the Object.setPrototypeOf !
class MyCustomError extends Error {
  constructor(message?: string) {
    super(message)

    // important for typescript custom error!
    Object.setPrototypeOf(this, new.target.prototype)

    this.name = 'MyCustomError'
  }
}
