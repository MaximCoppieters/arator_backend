import { Typegoose, prop, Ref } from "@hasezoey/typegoose";

export class Address extends Typegoose {
  _id?: string;
  addressLine: string;
  @prop({ required: true })
  latitude: number;
  @prop({ required: true })
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
}

export const AddressModel = new Address().getModelForClass(Address);
