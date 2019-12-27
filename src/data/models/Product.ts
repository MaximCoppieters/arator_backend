import * as mongoose from "mongoose";
import { Typegoose, prop, instanceMethod } from "@hasezoey/typegoose";
import { User } from "./User";
import { WeightUnit } from "./WeightUnit";

export class Product extends Typegoose {
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
  @prop({ required: true })
  seller: User;
}

export const ProductModel = new Product().getModelForClass(Product);
