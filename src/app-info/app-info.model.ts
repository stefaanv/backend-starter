export class AppInfo {
  public appName = ''
  public appDescription = ''
  public appAuthor = 'Stefaan Vandevelde'
  public version = 'v0.0.0'
  public commitId = 'unknown'

  setPackageInfo(pkg: { name: string; description: string; author: string; version: string }) {
    this.appName = pkg.name
    this.appAuthor = pkg.author
    this.appDescription = pkg.description
    this.version = pkg.version
  }
}
