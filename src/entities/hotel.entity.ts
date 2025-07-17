import { Entity, Property } from "@mikro-orm/core";
import { Accommodation } from "./accommodation.entity";

@Entity({ discriminatorValue: 'hotel' })
export class Hotel extends Accommodation {
  @Property()
  totalRooms!: number;

  @Property({ type: "number", check: "star_rating >= 1 AND star_rating <= 5" })
  starRating!: number;
}
