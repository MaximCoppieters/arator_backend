import { Schema } from "mongoose";
import * as mongoose from "mongoose";
export interface Product {
  name: string;
  imageUrl: string;
  description: string;
  priceInEuro: number;
  amount: number;
  weightUnit: string;
  type: string;
}

export const productSchema = {
  name: String,
  imageUrl: String,
  description: String,
  priceInEuros: Number,
  amount: Number,
  weightUnit: String,
  type: String,
  contactInfo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
};
