import * as dotenv from 'dotenv'
import { Options } from '@mikro-orm/core'

dotenv.config()

const config: Options = {
  entities: ['src/**/*.entity.ts', 'dist/**/*.entity.js'],
  dbName: process.env.DATABASE_DATABASE,
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  type: 'mariadb',
  debug: true,
}

/* geteste commando's
npx mikro-orm generate-entities --save --path=./generated-entities      # entiteiten genereren
npx mikro-orm migration:create -b                                       # nieuwe migratie toevoegen
npx mikro-orm migration:up                                              # mirgaties uitvoeren
*/

export default config
