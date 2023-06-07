import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { MikroORM } from '@mikro-orm/core'
import { config as dotenvConfig } from 'dotenv'
import { ConsoleLogger, INestApplication } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppInfoService } from './app-info/app-info.service'
import { LogService } from './logging/log.service'
export const APP_NAME = 'backup-starter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })
  const appInfoService = app.get(AppInfoService)
  await appInfoService.bootstrap()
  const { appName, version, commitId } = appInfoService.appInfo
  const logger = await getLogger(app)
  logger.info(`Starting ${appName} v${version} (commit ${commitId})`)
  updateDatabaseSchema(app, logger)
  const config = app.get(ConfigService)
  const port = config.get<number>('port', 3000)
  app.enableCors()
  await app.listen(port)
  logger.info(`${appName} is now available at port ${port}`)
}

dotenvConfig() // Nodig om environment variabelen aan te vullen met config in .env bestand
bootstrap()

async function getLogger(app: INestApplication) {
  app.useLogger(new ConsoleLogger())
  const appLogger = await app.resolve(LogService)
  appLogger.context = 'main'
  return appLogger
}

async function updateDatabaseSchema(app: INestApplication, logger: LogService) {
  const orm = app.get(MikroORM)
  const migrator = orm.getMigrator()
  const pendingMigrations = await migrator.getPendingMigrations()

  if (pendingMigrations.length > 0) {
    logger.info(`Starting database Migration.  This may take a while ...`, { consoleOnly: true })
    await migrator.up()
    logger.info(`... migrations finished`, { consoleOnly: true })
  }
}
