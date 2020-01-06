import { Product, ProductModel } from "../models/Product";
import { AddressModel, Address } from "../models/Address";
import { Service } from "typedi";
import { UserModel } from "../models/User";

@Service()
export class ProductRepo {
  async getProductsInRange(
    userLocation: number[],
    rangeInKm: number
  ): Promise<Product[]> {
    const sellerAddresses: Array<Address> = await AddressModel.find()
      .where("position")
      .near({
        maxDistance: rangeInKm,
        center: { type: "Point", coordinates: userLocation },
      })
      .populate("user")
      .populate("products");

    console.log(sellerAddresses);

    const products: Product[] = [];
    for (let i = 0; i < sellerAddresses.length; i++) {
      const seller = <any>sellerAddresses[i].user;

      const sellerProducts = await ProductModel.find({
        _id: { $in: seller.products },
      });
      sellerProducts.forEach(product => {
        product.seller = seller;
        products.push(product);
      });
    }
    return products;
  }

  async getProductsOfSellerById(id: string): Promise<Product[]> {
    return await ProductModel.find({
      "seller._id": id,
    }).select({
      "seller.password": 0,
      "seller.email": 0,
      "seller.userSettings": 0,
    });
  }

  async save(product: Product): Promise<void> {
    await ProductModel.create(product);
    const owner = await UserModel.findById(product.seller._id);
    console.log(owner);
    owner.products.push(product);
    await owner.save();
  }
}
