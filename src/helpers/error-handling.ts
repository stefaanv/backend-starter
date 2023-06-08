export function ensureError(value: unknown): Error {
  if (value instanceof Error) return value

  let stringified = '[Unable to stringify the thrown value]'
  try {
    stringified = JSON.stringify(value)
  } catch {}

  return new Error(stringified)
}

export async function to<T>(
  promise: Promise<T>,
  handleError?: (error: Error) => [null | Error, T | undefined],
): Promise<[null | Error, T | undefined]> {
  return promise
    .then((res: T) => [null, res] as [null, T])
    .catch((e: unknown) => {
      if (handleError) return handleError(ensureError(e))
      return [ensureError(e), undefined]
    })
}

export function toSync<T>(
  canThrow: () => T,
  handleError?: (error: Error) => [null | Error, T | undefined],
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
