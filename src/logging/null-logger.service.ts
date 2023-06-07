/* eslint-disable @typescript-eslint/no-empty-function */
import { LogInterface } from './log.interface'

export class NullLoggerService implements LogInterface {
  set context(_value: string) {}
  info() {}
  error() {}
  urgent() {}
  warn() {}
  debug() {}
  verbose() {}
}
