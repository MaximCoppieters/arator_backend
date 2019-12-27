import { Geocoder, Entry } from "node-geocoder";
import { Secrets } from "../../api/util/secrets";
import { Service } from "typedi";
import { Address } from "../../data/models/Address";
const GeoCoder = require("node-geocoder");

@Service()
export class GeoService {
  private geocoder: Geocoder = GeoCoder({
    provider: "openstreetmap",
  });

  async geocode(addressLine: string): Promise<Entry> {
    const result: Entry[] = await this.geocoder.geocode(addressLine);

    const codedAddress = result.pop();
    return codedAddress;
  }
}
