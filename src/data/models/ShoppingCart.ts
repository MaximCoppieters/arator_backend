import { prop, Ref, getModelForClass, arrayProp } from "@typegoose/typegoose";
import { User } from "./User";
import { ProductInCart } from "./ProductInCart";

export class ShoppingCart {
  _id?: string;

  @arrayProp({
    itemsRef: "ProductInCart",
  })
  productsInCart: ProductInCart[];

  @prop({ ref: "User" })
  user: Ref<User>;
}

export const ShoppingCartModel = getModelForClass(ShoppingCart);
