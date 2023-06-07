import { Migration } from '@mikro-orm/migrations';

export class Migration20230606131333 extends Migration {

  async up(): Promise<void> {
    this.addSql('select 1');
  }

}
