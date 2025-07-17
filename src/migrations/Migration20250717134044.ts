import { Migration } from '@mikro-orm/migrations';

export class Migration20250717134044 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "accommodation" add column "type" text check ("type" in (\'apartment\', \'hotel\')) not null, add column "total_rooms" int null, add column "star_rating" int null, add column "bedrooms" int null, add column "bathrooms" int null, add column "furnished" boolean null default false;');
    this.addSql('create index "accommodation_type_index" on "accommodation" ("type");');
  }

  async down(): Promise<void> {
    this.addSql('drop index "accommodation_type_index";');
    this.addSql('alter table "accommodation" drop column "type";');
    this.addSql('alter table "accommodation" drop column "total_rooms";');
    this.addSql('alter table "accommodation" drop column "star_rating";');
    this.addSql('alter table "accommodation" drop column "bedrooms";');
    this.addSql('alter table "accommodation" drop column "bathrooms";');
    this.addSql('alter table "accommodation" drop column "furnished";');
  }

}
