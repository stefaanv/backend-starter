import { ConsoleLogger, Injectable, Scope } from '@nestjs/common'
import { LogInterface, OptionalLogParameters, Severity } from './log.interface'
import chalk from 'chalk'
import { HttpLogSenderService } from './http-log-sender.service'

@Injectable({
  scope: Scope.TRANSIENT,
})
export class LogService implements LogInterface {
  private _context = 'unknown'
  private _nestLogger = new ConsoleLogger()

  constructor(private readonly _httpLogger: HttpLogSenderService) {}

  set context(value: string) {
    this._context = value
    this._nestLogger.setContext(value)
  }

  child(context: string) {
    const logService = new LogService(this._httpLogger)
    logService.context = context
  }

  formatForConsole(message: string, params?: OptionalLogParameters) {
    const uuidPart = params?.uuid ? `(${params?.uuid})` : ''
    const metaPart = params?.meta ? chalk.yellow('metadata: ' + JSON.stringify(params?.meta)) : ''
    let _message = message
    if (params?.emphasizeInConsole === 'color') _message = chalk.white(message)
    if (params?.emphasizeInConsole === 'startup') _message = `=-= ${message} =-=`
    const allDefined = [uuidPart, _message, metaPart].filter(s => s !== undefined)
    return allDefined.join(' ')
  }

  logToHttp(severity: Severity, message: string, params?: OptionalLogParameters) {
    this._httpLogger.sendGeneralLogToLogServer(
      message,
      severity,
      this._context,
      params?.uuid,
      params?.meta,
    )
  }

  log(message: string, params?: OptionalLogParameters) {
    this.info(message, params)
  }

  info(message: string, params?: OptionalLogParameters) {
    this._nestLogger.log(this.formatForConsole(message, params), params?.context ?? this._context)
    if (!params?.consoleOnly) this.logToHttp(Severity.info, message, params)
  }

  error(message: string, params?: OptionalLogParameters) {
    this._nestLogger.error(this.formatForConsole(message, params), params?.context ?? this._context)
    if (!params?.consoleOnly) this.logToHttp(Severity.error, message, params)
  }

  urgent(message: string, params?: OptionalLogParameters) {
    this._nestLogger.error(this.formatForConsole(message, params), params?.context ?? this._context)
    if (!params?.consoleOnly) this.logToHttp(Severity.urgent, message, params)
  }

  warn(message: string, params?: OptionalLogParameters) {
    this._nestLogger.warn(this.formatForConsole(message, params), params?.context ?? this._context)
    if (!params?.consoleOnly) this.logToHttp(Severity.warn, message, params)
  }

  debug(message: string, params?: OptionalLogParameters) {
    this._nestLogger.debug(this.formatForConsole(message, params), params?.context ?? this._context)
    if (!params?.consoleOnly) this.logToHttp(Severity.debug, message, params)
  }

  verbose(message: string, params?: OptionalLogParameters) {
    this._nestLogger.verbose(
      this.formatForConsole(message, params),
      params?.context ?? this._context,
    )
    if (!params?.consoleOnly) this.logToHttp(Severity.verbose, message, params)
  }
}
