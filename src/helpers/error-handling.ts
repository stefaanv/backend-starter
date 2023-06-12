export function ensureError<E = Error>(value: unknown): E {
  if (value instanceof Error) return value as E

  let stringified = '[Unable to stringify the thrown value]'
  try {
    stringified = JSON.stringify(value)
  } catch {}

  return new Error(stringified) as E
}

export type FailTuple<E = Error> = [E, undefined]
export type SuccessTuple<T> = [null, T]
export type FailOrSuccessTuple<T, E = Error> = FailTuple<E> | SuccessTuple<T>
export type HandleErrorFn<T, E = Error> = (error: E) => FailOrSuccessTuple<T, E>
const processCatch = <T, E = Error>(e: unknown, handleError?: HandleErrorFn<T, E>) => {
  if (handleError) return handleError(ensureError(e))
  return [ensureError(e), undefined] as FailOrSuccessTuple<T, E>
}

export async function to<T, E = Error>(promise: Promise<T>): Promise<FailOrSuccessTuple<T, E>>
export async function to<T, E = Error>(
  promise: Promise<T>,
  handleError: HandleErrorFn<T, E>,
): Promise<FailOrSuccessTuple<T, E>>
export async function to<T, E = Error>(
  promise: Promise<T>,
  handleError: HandleErrorFn<T, E>,
  handlesAllErrors: true,
): Promise<SuccessTuple<T>>
export async function to<T, E = Error>(
  promise: Promise<T>,
  handleError?: HandleErrorFn<T, E>,
): Promise<FailOrSuccessTuple<T, E>> {
  return promise
    .then((result: T) => [null, result] as SuccessTuple<T>)
    .catch((e: unknown) => {
      return processCatch<T, E>(e, handleError)
    })
}

export function tos<T, E = Error>(
  canThrow: () => T,
  handleError?: HandleErrorFn<T, E>,
): FailOrSuccessTuple<T, E> {
  try {
    return [null, canThrow()]
  } catch (e: unknown) {
    if (handleError) return handleError(ensureError(e))
    return [ensureError<E>(e), undefined]
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
