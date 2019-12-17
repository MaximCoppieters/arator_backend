import { timesSeries } from "async";
import { string } from "@hapi/joi";

export class GeoLocation {
  protected coordinates: Array<number>;
  public static LONGITUDE_POSITION = 0;
  protected static LATITUDE_POSITION = 1;
  protected static LATITUDE_BOUND = 85;
  protected static LONGITUDE_BOUND = 180;
}

export const geoLocationSchema = {
  coordinates: [Number],
  type: { type: String },
};
