import { Document } from "mongoose";
import { FishRepository as FishRepositoryInterface } from "./interfaces";
import { Product, productSchema } from "../models/Product";
import { GenericRepository } from "./GenericRepository";
import { Service } from "typedi";

export interface ProductModel extends Product, Document {}

@Service()
export class ProductRepository extends GenericRepository<Product, ProductModel>
  implements FishRepositoryInterface {
  public constructor() {
    super("Product", productSchema);
  }
}
