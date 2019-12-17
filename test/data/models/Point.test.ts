import { Point } from "../../../src/data/models/geography/Point";

describe.only("Geometry", () => {
  const sut = new Point(45, 45);

  it("Set longitude throws error when above maximum threshold", () => {
    const invalidLongitude = 181;

    expect(() => (sut.longitude = invalidLongitude)).toThrowError();
  });

  it("Set longitude throws error when below minimum threshold", () => {
    const invalidLongitude = -181;

    expect(() => (sut.longitude = invalidLongitude)).toThrowError();
  });

  it("Set longitude does not throw error when between thresholds", () => {
    const validLongitude = 20;

    expect(() => (sut.longitude = validLongitude)).not.toThrowError();
  });

  it("Set latitude throws error when above maximum threshold", () => {
    const invalidLatitude = 86;

    expect(() => (sut.latitude = invalidLatitude)).toThrowError();
  });

  it("Set longitude throws error when below minimum threshold", () => {
    const invalidLatitude = -86;

    expect(() => (sut.latitude = invalidLatitude)).toThrowError();
  });

  it("Set longitude does not throw error when between thresholds", () => {
    const validLatitude = 20;

    expect(() => (sut.latitude = validLatitude)).not.toThrowError();
  });
});
