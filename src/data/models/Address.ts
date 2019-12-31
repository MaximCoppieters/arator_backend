import { Typegoose, prop, index, arrayProp, Ref } from "@hasezoey/typegoose";
import { User } from "./User";

@index({ position: "2dsphere" })
export class Address extends Typegoose {
  _id?: string;
  addressLine: string;

  @arrayProp({ items: Array })
  position?: [[Number]];

  latitude: number;
  longitude: number;

  @prop({ required: true })
  city: string;
  @prop({ required: true })
  zipcode: string;
  @prop({ required: true })
  streetName: string;
  @prop({ required: true })
  streetNumber: string;
  @prop({ required: true })
  country: string;
  @prop({
    required: true,
    ref: "User",
  })
  user: Ref<User>;
}

export const AddressModel = new Address().getModelForClass(Address);
