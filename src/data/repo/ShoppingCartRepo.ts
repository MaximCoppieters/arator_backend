import { Service } from "typedi";
import { ShoppingCart, ShoppingCartModel } from "../models/ShoppingCart";

@Service()
export class ShoppingCartRepo {
  async getShoppingCart(shoppingCartId: string): Promise<ShoppingCart> {
    return ShoppingCartModel.findById(shoppingCartId);
  }

  async updateShoppingCart(shoppingCart: ShoppingCart): Promise<void> {
    await ShoppingCartModel.findByIdAndUpdate(shoppingCart._id, shoppingCart, {
      upsert: true,
    });
  }
}
