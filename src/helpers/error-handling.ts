export function encapsulateError(error: any) {
  if (error instanceof Error) return error
  if (Object.keys(error).includes('message')) return new Error(error.message)
  return new Error(JSON.stringify(error))
}
