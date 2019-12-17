import { GeoLocation, geoLocationSchema } from "./GeoLocation";
import { Point, pointSchema } from "./Point";
export interface FishingStore {
  location: Point;
}

export const fishingStoreSchema = {
  location: pointSchema,
};
