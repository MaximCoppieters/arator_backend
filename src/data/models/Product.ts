import * as mongoose from "mongoose";
import { Typegoose, prop, instanceMethod } from "typegoose";
import { User } from "./User";

export class Product extends Typegoose {
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
  @prop({ required: true })
  weightUnit: string;
  @prop()
  type: string;
  @prop({ required: true })
  seller: User;
}

export const ProductModel = new Product().getModelForClass(Product);
