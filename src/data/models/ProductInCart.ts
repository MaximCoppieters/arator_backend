import { Product } from "./Product";
import { prop, Ref, getModelForClass } from "@typegoose/typegoose";

export class ProductInCart {
  @prop({
    ref: "Product",
  })
  product: Ref<Product>;
  @prop()
  amount: number;
}

export const ProductInCartModel = getModelForClass(ProductInCart);
