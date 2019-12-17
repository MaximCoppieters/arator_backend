import { Request, Response } from "express";
import { Service } from "typedi";
import { ProductRepository } from "../../data/repository/ProductRepository";
import { Product } from "../../data/models/Product";

@Service()
export class ProductController {
  private productRepository: ProductRepository;

  constructor(productRepository: ProductRepository) {
    this.productRepository = productRepository;
  }

  /**
   * GET /api/product
   */
  getAll = async (req: Request, res: Response) => {
    const products = await this.productRepository.findAll();
    res.json(products);
  };

  /**
   * POST /api/product
   */
  post = async (req: Request, res: Response) => {
    const product: Product = {
      amount: 1,
      description: "Lorem ipsum",
      imageUrl: "http://ab8ec492.ngrok.io/apples.jpg",
      name: "Apple",
      priceInEuro: 1.8,
      type: "Jonagold",
      weightUnit: "KILOGRAM",
    };
    await this.productRepository.save(product);
    return res.send(200);
  };
}
