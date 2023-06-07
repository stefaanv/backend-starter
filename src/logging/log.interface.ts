export type Emphasize = 'color' | 'startup'

export interface OptionalLogParameters {
  context?: string
  uuid?: string
  meta?: unknown
  consoleOnly?: boolean
  emphasizeInConsole?: Emphasize
}

export enum Severity {
  urgent,
  error,
  warn,
  info,
  debug,
  verbose,
}

export interface LogInterface {
  context: string
  info(message: string, params?: OptionalLogParameters): void
  error(message: string, params?: OptionalLogParameters): void
  urgent(message: string, params?: OptionalLogParameters): void
  warn(message: string, params?: OptionalLogParameters): void
  debug(message: string, params?: OptionalLogParameters): void
  verbose(message: string, params?: OptionalLogParameters): void
}
