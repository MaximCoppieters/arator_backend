import { Service } from "typedi";
import { ShoppingCartRepo } from "../../data/repo/ShoppingCartRepo";
import { Request, Response } from "express";
import { ShoppingCartValidator } from "../util/ShoppingCartValidator";
import { User, UserModel } from "../../data/models/User";
import { ObjectId } from "mongodb";
import { Ref } from "@typegoose/typegoose";
import {
  ShoppingCartModel,
  ShoppingCart,
} from "../../data/models/ShoppingCart";

@Service()
export class ShoppingCartController {
  constructor(
    private shoppingCartRepo: ShoppingCartRepo,
    private validator: ShoppingCartValidator
  ) {}

  /**
   * GET /api/user/shoppingcart
   */
  getUserShoppingCart = async (req: Request, res: Response) => {
    const user = await UserModel.findById((<any>req.user)._id).populate(
      "shoppingCart"
    );
    return res.json(user.shoppingCart);
  };

  /**
   * POST /api/user/shoppingcart
   */
  postUserShoppingCart = async (req: Request, res: Response) => {
    const { error } = this.validator.validateShoppingCart(req.body);
    if (error) {
      return res.status(400).json(error);
    }
    const shoppingCartEntry = req.body;
    shoppingCartEntry.user = (<User>req.user)._id;
    shoppingCartEntry._id = (<User>req.user).shoppingCart;

    const shoppingCart = new ShoppingCartModel(shoppingCartEntry);

    try {
      await this.shoppingCartRepo.updateShoppingCart(shoppingCart);
      return res.status(201).end();
    } catch (error) {
      return res.status(400).json(error);
    }
  };
}
