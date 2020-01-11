import { prop, Ref, getModelForClass, index } from "@typegoose/typegoose";
import { User } from "./User";

@index({ position: "2dsphere" })
export class Address {
  _id?: string;
  addressLine: string;

  @prop({ required: true })
  position?: [Number, Number];

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

export const AddressModel = getModelForClass(Address);
