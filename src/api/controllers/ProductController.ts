import { Request, Response } from "express";
import { Service } from "typedi";
import { ProductModel, Product } from "../../data/models/Product";
import { ProductValidator } from "../util/ProductValidator";
import { ImageHelper } from "../util/ImageHelper";
import { UserModel, User } from "../../data/models/User";
import { AddressModel, Address } from "../../data/models/Address";
import { ProductRepo } from "../../data/repo/ProductRepo";

@Service()
export class ProductController {
  constructor(
    private validator: ProductValidator,
    private imageHelper: ImageHelper,
    private productRepo: ProductRepo
  ) {}
  /**
   * GET /api/product
   */
  getProductsInDistanceRange = async (req: Request, res: Response) => {
    const userLocation = req.body.position;
    // this.imageHelper.prependProductImagePaths(products);

    const products: Product[] = await this.productRepo.getProductsInRange(
      userLocation,
      5
    );
    res.json(products);
    // res.json(products);
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
    const { error } = this.validator.validateNewProduct(product);

    if (error) {
      console.log(error);
      return res.status(400).json(error);
    }

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
