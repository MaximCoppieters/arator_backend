import { Request, Response } from "express";
import { Service } from "typedi";
import { ProductModel, Product } from "../../data/models/Product";
import { ProductValidator } from "../util/ProductValidator";
import { ImageHelper } from "../util/ImageHelper";
import { UserModel, User } from "../../data/models/User";
import { WeightUnit } from "../../data/models/WeightUnit";

@Service()
export class ProductController {
  constructor(
    private validator: ProductValidator,
    private imageHelper: ImageHelper
  ) {}
  /**
   * GET /api/product
   */
  getAll = async (req: Request, res: Response) => {
    const products: Array<Product> = await ProductModel.find().select({
      "seller.password": 0,
      "seller.email": 0,
      "seller.userSettings": 0,
    });

    this.imageHelper.prependProductImagePaths(products);

    res.send(products);
  };

  /**
   * GET /api/product/personal
   */
  getPersonalProducts = async (req: Request, res: Response) => {
    const user: any = req.user;
    const products: Array<Product> = await ProductModel.find({
      "seller._id": user._id,
    }).select({
      "seller.password": 0,
      "seller.email": 0,
      "seller.userSettings": 0,
    });

    this.imageHelper.prependProductImagePaths(products);

    res.send(products);
  };

  /**
   * POST /api/product
   */
  post = async (req: any, res: Response) => {
    const product = new ProductModel({
      name: req.body.name,
      description: req.body.description,
      amount: req.body.amount,
      imageUrl: req.files.image?.path,
      priceInEuro: req.body.priceInEuro,
      type: req.body.type,
      weightUnit: req.body.weightUnit,
      seller: req.user,
    });
    console.log(product);
    const { error } = this.validator.validateNewProduct(product);

    if (error) {
      console.log(error);
      return res.status(400).json(error);
    }

    try {
      this.imageHelper.saveProductImage(product);
      const { _id } = await product.save();
      return res.status(201).json({ id: _id });
    } catch (err) {
      console.log(err);
      this.imageHelper.deleteProductImage(product);
      return res.status(400).json({ message: err.message });
    }
  };

  delete = async (req: Request, res: Response) => {
    await ProductModel.find()
      .remove()
      .exec();
    return res.status(200).end();
  };
}
