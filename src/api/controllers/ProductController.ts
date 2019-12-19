import { Request, Response } from "express";
import { Service } from "typedi";
import { UserModel } from "../../data/models/User";
import { ProductModel } from "../../data/models/Product";

@Service()
export class ProductController {
  /**
   * GET /api/product
   */
  getAll = async (req: Request, res: Response) => {
    const products = await ProductModel.find().select({
      "seller.password": 0,
      "seller.email": 0,
    });

    res.send(products);
  };

  /**
   * POST /api/product
   */
  post = async (req: Request, res: Response) => {
    const product = new ProductModel({
      name: req.body.name,
      description: req.body.description,
      amount: req.body.amount,
      imageUrl: req.body.imageUrl,
      priceInEuro: req.body.priceInEuro,
      type: req.body.type,
      weightUnit: req.body.weightUnit,
      seller: req.user,
    });
    try {
      const { _id } = await product.save();
      return res.status(201).json({ id: _id });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };
}
