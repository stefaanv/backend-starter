import { HttpService } from '@nestjs/axios'
import { ConsoleLogger, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { URL } from 'url'
import { join } from 'path'
import { CreateLogMessage } from './log-message.model'
import { Severity } from './log.interface'

interface LogServer {
  baseUrl: string
  isAvailable: boolean | undefined // undefined wanneer de toestand nog niet gekend is
  poller: null | ReturnType<typeof setInterval>
}

@Injectable()
export class HttpLogSenderService {
  private readonly _logServers: LogServer[]
  private readonly _availabilityPollInterval: number
  private _activeLogServer: LogServer | undefined
  private readonly _primaryLogServer: LogServer
  private readonly _consoleLogger: ConsoleLogger = new ConsoleLogger('HttpToLogServerService')

  //TODO nog vereenvoudigen, flow chart maken
  constructor(
    private readonly _configService: ConfigService,
    private readonly _httpService: HttpService,
  ) {
    this._logServers = this._configService
      .get<string[]>('logServers', [])
      .filter(ls => ls)
      .map(ls => ({ baseUrl: ls, isAvailable: undefined, poller: null }))
    this._activeLogServer = this._logServers[0]
    this._primaryLogServer = this._logServers[0]
    this._logServers.forEach(server => this.checkAvailabilityOf(server))
    this._availabilityPollInterval = this._configService.get(
      'pollLogServerAvailabilityIntervalSec',
      300,
    )
  }

  public sendGeneralLogToLogServer(
    message: string,
    severity: Severity,
    context: string,
    uid?: string,
    meta?: any,
  ): void {
    const fullUrl = this.activeUrl('/log/general')
    const log = CreateLogMessage(message, context, severity)
    if (uid) log.uid = uid
    if (meta) log.meta = meta
    if (fullUrl) {
      this._httpService
        .post(fullUrl, log)
        .subscribe({ error: error => this.handleHttpError(error, fullUrl) })
    }
  }

  private handleHttpError(response: any, url: string) {
    console.log(`AXIOS error in HttpLogSenderService.handleHttpError (url='${url}') :`)
    console.log(response.error)
    if (!response.isAxiosError) return
    if (response.code === 'ECONNREFUSED') {
      // Fout tijdens het versturen van een logboodschap - zet de actieve server op "niet beschikbaar"
      if (this._activeLogServer) this.setUnavailable(this._activeLogServer)
    } else {
      this._consoleLogger.error(`Other error while sending log: ${response.message}`)
    }
  }

  setAvailable(server: LogServer) {
    const availabilityHasChanged = server.isAvailable != true
    if (availabilityHasChanged)
      this._consoleLogger.log(
        `Log server ${server.baseUrl} ${availabilityHasChanged ? 'became' : 'is'} available`,
      )
    if (server == this._primaryLogServer || !this._logServers.some(s => s.isAvailable)) {
      // Zet deze server terug als actieve server indien het de primary is of indien geen enkele andere server beschikbaar is
      this._consoleLogger.log(`switching active log server to ${server.baseUrl}`)
      this._activeLogServer = server
    }
    server.isAvailable = true
    if (server.poller !== null) {
      clearInterval(server.poller)
      server.poller = null
    }
  }

  setUnavailable(server: LogServer, message = '') {
    const availabilityHasChanged = server.isAvailable != false
    if (availabilityHasChanged) {
      // melding enkel bij verandering of wanneer geen enkele server beschikbaar
      const msg = `Log server ${server.baseUrl} ${
        availabilityHasChanged ? 'became' : 'is'
      } UNAVAILABLE ${message}`
      this._consoleLogger.log(msg)
    }
    server.isAvailable = false

    if (server === this._activeLogServer || !this._activeLogServer) {
      // Zoek een andere beschikbare server
      const availableServers = this._logServers.filter(
        ls => ls.isAvailable == true || ls.isAvailable == undefined,
      )
      if (availableServers.length > 0) {
        this._consoleLogger.log(`switching active log server to ${availableServers[0].baseUrl}`)
        this._activeLogServer = availableServers[0]
      } else {
        this._consoleLogger.error(`NONE of the log servers are available`)
        this._activeLogServer = undefined
      }
    }
    if (server.poller === null) {
      // Start pollen op indien dit de primary server is
      server.poller = setInterval(
        () => this.checkAvailabilityOf(server),
        1000 * this._availabilityPollInterval,
      )
    }
  }

  // Checkt de beschikbaarheid van een log server en past voorziene lokale variabelen aan, start/stopt de poller
  private async checkAvailabilityOf(server: LogServer) {
    this._httpService.get(this.calcUrl(server, 'check')).subscribe({
      next: data => (data.data === 'ok' ? this.setAvailable(server) : this.setUnavailable(server)),
      error: e => this.setUnavailable(server, e.message),
    })
  }

  private calcUrl(server: LogServer, ...paths: string[]): string {
    if (!server) return ''
    const baseUrl = server.baseUrl
    const fullUrl = new URL(join(baseUrl, ...paths))
    return fullUrl.toString()
  }

  private activeUrl(...paths: string[]): string | null {
    if (!this._activeLogServer) return null
    return this.calcUrl(this._activeLogServer, ...paths)
  }
}
