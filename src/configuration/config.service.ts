import { Injectable } from '@nestjs/common'
import { watch } from 'fs/promises'
import { join } from 'path'
import { readFileSync } from 'fs'
import { ConfigService as NestConfigService } from '@nestjs/config'
import * as childProcess from 'child_process'
import { LogService } from '@src/logging/log.service'

const ROOT_PACKAGE_REL_FOLDER_DEV = '../../../../package.json'
const ROOT_PACKAGE_REL_FOLDER_OTHER = './package.json' //TODO nog aanpassen
type PackageJson = { name: string; version: string; author: string; description: string }

//TODO!!! not debuggen na overzetten v/d config service uit fullstack starter

@Injectable()
export class ConfigService {
  private _config: { appInfo: AppInfoDto } | Record<string, unknown> = {}
  private _configFullpath: string
  private _feConfigFullpath: string
  private _rootPackageJsonFullpath: string
  public appInfo = new AppInfoDto()

  constructor(
    private readonly _configService: NestConfigService,
    private readonly _log: LogService,
  ) {
    const configFolder = join(__dirname, '../..', process.env.CONFIG_FOLDER ?? 'test')
    this._configFullpath = join(configFolder, CONFIG_FILE_NAME)
    this._feConfigFullpath = join(configFolder, FRONTEND_CONFIG_FILE_NAME)
    const packageJsonRootPath = process.env.NODE_ENV?.toLowerCase().startsWith('dev')
      ? ROOT_PACKAGE_REL_FOLDER_DEV
      : ROOT_PACKAGE_REL_FOLDER_OTHER
    this._rootPackageJsonFullpath = join(__dirname, packageJsonRootPath)
  }

  async startWatcher() {
    try {
      const watcher = watch(this._configFullpath)
      for await (const event of watcher) {
        this.bootstrap()
      }
    } catch (err) {
      const error = encapsulateError(err)
      this._log.error(`Unable to watch config folder - "${error.message}"`)
    }
  }

  async readPackageJson() {
    const content = readFileSync(this._rootPackageJsonFullpath).toString()
    const pkg: PackageJson = JSON.parse(content)
    this.appInfo.setPackageInfo(pkg)
  }

  async bootstrap() {
    this.readPackageJson()
    this.appInfo.commitId = this.getCommitId()
    let content = '{}'
    // TODO also replace values from a secrets vault
    try {
      content = readFileSync(this._configFullpath).toString()
    } catch (err) {
      const error = encapsulateError(err)
      this._log.error(`Configuration file not found - "${error.message}"`)
    }
    if (content) {
      const matches = content.match(/({{\w+}})/gm)
      if (matches) {
        for (const match of matches) {
          const value = process.env[match.replace(/{{|}}/g, '')]
          if (value) content = content.replace(new RegExp(`${match}`, 'gm'), value)
        }
      }
      this._config = JSON.parse(content)
    }
    this.startWatcher()
  }

  getCommitId() {
    if (process.env.COMMIT) return process.env.COMMIT
    if (process.env.NODE_ENV?.startsWith('dev')) {
      try {
        return childProcess.execSync('git rev-parse --short HEAD').toString().trim()
      } catch (error) {
        return 'no-git-repo'
      }
    }
    return 'unknown'
  }

  public get<T>(keyChain: string, defaultValue: T | undefined) {
    let result: any = this._config
    for (const k of keyChain.split('.')) {
      if (!Object.getOwnPropertyNames(this._config).includes(k)) {
        result = undefined
        break
      } else {
        const tuple = Object.entries(this._config).find(([key, value]) => key === k)
        result = tuple ? (tuple[1] as T) : undefined
      }
    }
    return result ?? defaultValue
  }

  public async getFrontendConfig() {
    const fn = (await import(this._feConfigFullpath)).default
    const feConfig = { ...fn(this._config), appInfo: this.appInfo }
    return feConfig
  }
}
