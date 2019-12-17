import { GeoLocation } from "./GeoLocation";

export class Point extends GeoLocation {
  public type = "Point";

  public constructor(longitude: number, latitude: number) {
    super();
    this.longitude = longitude;
    this.latitude = latitude;
  }

  public get longitude() {
    return super.coordinates[GeoLocation.LONGITUDE_POSITION];
  }

  public get latitude() {
    return super.coordinates[GeoLocation.LATITUDE_POSITION];
  }

  public set longitude(value) {
    if (this.isInvalidLongitude(value)) {
      throw new Error("Invalid longitude");
    }
    super.coordinates[GeoLocation.LONGITUDE_POSITION] = value;
  }

  public set latitude(value) {
    if (this.isInvalidLatitude(value)) {
      throw new Error("Invalid latitude");
    }
    super.coordinates[GeoLocation.LATITUDE_POSITION] = value;
  }

  private isInvalidLongitude(longitude: number): boolean {
    return (
      longitude > GeoLocation.LONGITUDE_BOUND ||
      longitude < -GeoLocation.LONGITUDE_BOUND
    );
  }

  private isInvalidLatitude(latitude: number): boolean {
    return (
      latitude > GeoLocation.LATITUDE_BOUND ||
      latitude < -GeoLocation.LATITUDE_BOUND
    );
  }
}

export const pointSchema = {
  coordinates: [Number],
  type: { type: String },
};
