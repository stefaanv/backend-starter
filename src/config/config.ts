export default function config() {
  return {
    port: parseInt(process.env.DATABASE_HOST ?? '3000'),
    globalUrlPrefix: 'api/v1',
    logServers: ['http://dockerserver:3821'],
    database: {
      schema: 'msg',
      host: process.env.DATABASE_HOST ?? 'rsa-db-test.bruyland.be',
      username: process.env.DATABASE_USERNAME ?? 'ideos',
      password: process.env.DATABASE_PASSWORD ?? '<password>',
      type: 'mariadb',
      debug: false,
    },
  }
}
