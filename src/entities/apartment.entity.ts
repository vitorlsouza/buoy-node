import { Entity, Property } from "@mikro-orm/core";
import { Accommodation } from "./accommodation.entity";

@Entity({ discriminatorValue: 'apartment' })
export class Apartment extends Accommodation {
  @Property()
  bedrooms!: number;

  @Property()
  bathrooms!: number;

  @Property({ default: false })
  furnished!: boolean;
}
