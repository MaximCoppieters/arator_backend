import { Request, Response } from "express";
import { ProductModel, Product } from "../../data/models/Product";
import { ProductValidator } from "../util/ProductValidator";
import { ImageHelper } from "../util/ImageHelper";
import { UserModel, User } from "../../data/models/User";
import { AddressModel, Address } from "../../data/models/Address";
import { ProductRepo } from "../../data/repo/ProductRepo";
import { Service } from "typedi";

@Service()
export class ProductController {
  constructor(
    private validator: ProductValidator,
    private imageHelper: ImageHelper,
    private productRepo: ProductRepo
  ) {}
  /**
   * GET /api/product?latitude=120&longitude=40
   */
  getProductsInDistanceRange = async (req: Request, res: Response) => {
    console.log(req.body);
    const userLocation = req.body.position;

    const userProductDistanceSetting = (<any>req.user).userSettings
      .maxProductDistance;
    const products: Product[] = await this.productRepo.getProductsInRange(
      userLocation,
      userProductDistanceSetting
    );
    this.imageHelper.prependProductImagePaths(products);
    res.json(products);
  };

  /**
   * GET /api/product/personal
   */
  getPersonalProducts = async (req: Request, res: Response) => {
    const products: Product[] = await this.productRepo.getProductsOfSellerById(
      (<User>req.user)._id
    );

    this.imageHelper.prependProductImagePaths(products);

    res.send(products);
  };

  /**
   * POST /api/product
   */
  post = async (req: any, res: Response) => {
    const product = new ProductModel(req.body);

    try {
      this.imageHelper.saveProductImage(product);
      await this.productRepo.save(product);
      return res.status(201).json({ id: product._id });
    } catch (err) {
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
