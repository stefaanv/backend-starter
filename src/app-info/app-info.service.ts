import { Injectable } from '@nestjs/common'
import { join } from 'path'
import { readFileSync } from 'fs'
import * as childProcess from 'child_process'
import { AppInfo } from './app-info.model'
import { APP_NAME } from '@src/main'

const ROOT_PACKAGE_REL_FOLDER_DEV = '../../package.json'
const ROOT_PACKAGE_REL_FOLDER_OTHER = './package.json' //TODO nog aanpassen
type PackageJson = { name: string; version: string; author: string; description: string }

@Injectable()
export class AppInfoService {
  private _rootPackageJsonFullpath: string
  public appInfo = new AppInfo()

  constructor() {
    this.appInfo.appName = APP_NAME
    const packageJsonRootPath = process.env.NODE_ENV?.toLowerCase().startsWith('dev')
      ? ROOT_PACKAGE_REL_FOLDER_DEV
      : ROOT_PACKAGE_REL_FOLDER_OTHER
    this._rootPackageJsonFullpath = join(__dirname, packageJsonRootPath)
  }

  async bootstrap() {
    const content = readFileSync(this._rootPackageJsonFullpath).toString()
    const pkg: PackageJson = JSON.parse(content)
    this.appInfo.setPackageInfo(pkg)
    if (process.env.COMMIT) return process.env.COMMIT
    this.appInfo.commitId = 'unknown'
    if (process.env.NODE_ENV?.startsWith('dev')) {
      try {
        this.appInfo.commitId = childProcess
          .execSync('git rev-parse --short HEAD')
          .toString()
          .trim()
      } catch (error) {
        this.appInfo.commitId = 'no-git-repo'
      }
    }
  }
}
