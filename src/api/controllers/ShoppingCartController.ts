import { Service } from "typedi";
import { ShoppingCartRepo } from "../../data/repo/ShoppingCartRepo";
import { Request, Response } from "express";
import { ShoppingCartValidator } from "../util/ShoppingCartValidator";
import { User, UserModel } from "../../data/models/User";
import { ObjectId } from "mongodb";
import { Ref } from "@typegoose/typegoose";
import { ProductInCartModel } from "../../data/models/ProductInCart";
import { ShoppingCartModel } from "../../data/models/ShoppingCart";
import { ProductModel } from "../../data/models/Product";
import { ImageHelper } from "../util/ImageHelper";

@Service()
export class ShoppingCartController {
  constructor(
    private shoppingCartRepo: ShoppingCartRepo,
    private validator: ShoppingCartValidator,
    private imageHelper: ImageHelper
  ) {}

  /**
   * GET /api/user/shoppingcart
   */
  getUserShoppingCart = async (req: Request, res: Response) => {
    // const user = await UserModel.findById((<any>req.user)._id).populate({
    //   path: "shoppingCart",
    //   populate: {
    //     path: "productsInCart",
    //   },
    // });
    const products = await ProductModel.find();
    this.imageHelper.prependProductImagePaths(products);
    const shoppingCart = new ShoppingCartModel();

    let amount = 0;
    amount++;
    for (const product of products) {
      const productInCart = new ProductInCartModel();
      productInCart.product = product;
      productInCart.amount = amount;
      shoppingCart.productsInCart.push(productInCart);
    }
    return res.json(shoppingCart);
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
    for (let i = 0; i < shoppingCartEntry.productsInCart.length; i++) {
      shoppingCartEntry.productsInCart[i] = new ProductInCartModel(
        shoppingCartEntry.productsInCart[i]
      );
    }

    const shoppingCart: any = new ShoppingCartModel(shoppingCartEntry);
    console.log(shoppingCart.productsInCart);

    try {
      await this.shoppingCartRepo.updateShoppingCart(shoppingCart);
      shoppingCart.productsInCart.foreach((productInCart: any) => {
        productInCart.save();
      });
      return res.status(201).end();
    } catch (error) {
      return res.status(400).json(error);
    }
  };
}
