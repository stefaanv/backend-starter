import { Module } from '@nestjs/common'
import { HttpLogSenderService } from './http-log-sender.service'
import { LogService } from './log.service'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [HttpModule],
  providers: [HttpLogSenderService, LogService],
  exports: [LogService],
})
export class LogModule {}
