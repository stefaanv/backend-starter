import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { MikroOrmModule, MikroOrmModuleSyncOptions } from '@mikro-orm/nestjs'
import { ConfigModule, ConfigService } from '@nestjs/config'
import config from './config/config'
import { LogModule } from './logging/logging.module'
import { AppInfoService } from './app-info/app-info.service'

@Module({
  imports: [
    LogModule,
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    MikroOrmModule.forRootAsync({
      useFactory: ormFactory,
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AppInfoService],
})
export class AppModule {}

async function ormFactory(config: ConfigService): Promise<MikroOrmModuleSyncOptions> {
  const dbOptions: MikroOrmModuleSyncOptions = {
    entities: ['dist/**/*.entity.js'],
    entitiesTs: ['src/**/*.entity.ts'],
    dbName: 'msg',
    host: config.get<string>('database.host', 'rsa-db-test.bruyland.be'),
    user: config.get<string>('database.username', 'empty_user'),
    password: config.get<string>('database.password', 'empty_password'),
    type: 'mariadb',
    timezone: 'Europe/Brussels',
    migrations: {
      path: 'dist/migrations',
      pathTs: 'src/migrations',
      tableName: 'mikro_orm_migrations',
      transactional: false, // wrap each migration in a transaction
      disableForeignKeys: true, // wrap statements with `set foreign_key_checks = 0` or equivalent
      allOrNothing: false, // wrap all migrations in master transaction
      dropTables: false, // allow to disable table dropping
      safe: false, // allow to disable table and column dropping
      emit: 'ts', // migration generation mode
    },
    debug: config.get<boolean>('database.debug', false),
    logger: console.log,
  }

  return dbOptions
}
