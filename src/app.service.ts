import { Injectable } from '@nestjs/common'
import { LogService } from '@src/logging/log.service'

@Injectable()
export class AppService {
  constructor(private readonly logger: LogService) {}

  getHello(): string {
    this.logger.info('getHello was called')
    return 'Hello World!'
  }
}
