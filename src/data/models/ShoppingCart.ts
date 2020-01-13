import { prop, Ref, getModelForClass, arrayProp } from "@typegoose/typegoose";
import { User } from "./User";

export class ShoppingCart {
  _id?: string;

  @prop({ required: true, default: {} })
  amountByProductId: Map<string, number>;

  @prop({ ref: "User" })
  user: Ref<User>;
}

export const ShoppingCartModel = getModelForClass(ShoppingCart);
