import { Controller, Get } from '@nestjs/common'
import { AppInfoService } from './app-info/app-info.service'

@Controller()
export class AppController {
  constructor(private readonly appInfoService: AppInfoService) {}

  @Get()
  getAppInfo() {
    return this.appInfoService.appInfo
  }
}
