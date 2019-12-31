import * as mongoose from "mongoose";
import { Typegoose, prop, index, getModelForClass } from "@typegoose/typegoose";
import { User } from "./User";
import { WeightUnit } from "./WeightUnit";

@index({ "seller.address.position": "2dsphere" })
export class Product {
  _id?: string;
  @prop({ required: true })
  name: string;
  @prop({ required: true })
  imageUrl: string;
  @prop()
  description: string;
  @prop({ required: true })
  priceInEuro: number;
  @prop({ required: true })
  amount: number;
  @prop({ required: true, enum: WeightUnit })
  weightUnit: string;
  @prop()
  type: string;
  @prop({
    required: true,
    ref: "User",
  })
  seller: User;
}

export const ProductModel = getModelForClass(Product);
