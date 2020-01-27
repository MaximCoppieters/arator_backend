import { Product, ProductModel } from "../models/Product";
import { AddressModel, Address } from "../models/Address";
import { Service } from "typedi";
import { UserModel, User } from "../models/User";

@Service()
export class ProductRepo {
  async getProductsInRange(
    userLocation: number[],
    rangeInKm: number
  ): Promise<Product[]> {
    const sellerAddresses: Array<Address> = await AddressModel.find()
      .populate("user")
      .populate("product");

    const products: Product[] = [];
    for (let i = 0; i < sellerAddresses.length; i++) {
      const seller = <any>sellerAddresses[i].user;
      this.removePrivateDetails(seller);

      const sellerProducts = await ProductModel.find({
        _id: { $in: seller.products },
      });
      sellerProducts.forEach(product => {
        product.seller = seller;
        product.seller.products = undefined;
        products.push(product);
      });
    }
    return products;
  }

  async getProductsOfSellerById(id: string): Promise<Product[]> {
    const products = await ProductModel.find({
      "seller._id": id,
    });
    products.forEach(product => this.removePrivateDetails(product.seller));
    return products;
  }

  private removePrivateDetails(user: User) {
    user.password = undefined;
    user.email = undefined;
    user.userSettings = undefined;
  }

  async save(product: Product): Promise<void> {
    await ProductModel.create(product);
    const owner = await UserModel.findById(product.seller._id);
    console.log(owner);
    owner.products.push(product);
    await owner.save();
  }
}
