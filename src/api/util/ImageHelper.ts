import { Service } from "typedi";
import { Product } from "../../data/models/Product";
import fs from "fs";
import path from "path";
import { AppInfo } from "../../app";
import { User } from "../../data/models/User";

@Service()
export class ImageHelper {
  static readonly DEFAULT_PROFILE_IMAGE = "default_profile.png";

  saveProductImage(product: Product) {
    const userImageFolderUri = this.getUserImageFolder(product.seller);
    if (this.userImageFolderAbsent(userImageFolderUri)) {
      fs.mkdirSync(userImageFolderUri);
    }
    const imageName = path.basename(product.imageUrl);
    const targetImageUri = path.join(userImageFolderUri, imageName);
    fs.rename(product.imageUrl, targetImageUri, err => {
      if (err) throw err;
    });
    product.imageUrl = imageName;
  }

  private getUserImageFolder(user: User) {
    return path.join(AppInfo.publicUserImages, user._id);
  }

  private getRelativeUserImageFolder(user: User) {
    return path.join(AppInfo.publicUserImagesRelative, user._id);
  }

  private userImageFolderAbsent(path: string) {
    return !fs.existsSync(path);
  }

  deleteProductImage(product: Product) {
    const imagePath = path.join(
      AppInfo.publicUserImages,
      product.seller._id,
      product.imageUrl
    );

    fs.unlink(imagePath, err => {
      if (err) {
        console.error(err);
      }
    });
  }

  prependProductImagePaths(products: Array<Product>): void {
    products.forEach(product => {
      const userImageFolder = this.getRelativeUserImageFolder(product.seller);
      product.imageUrl = path.join(userImageFolder, product.imageUrl);
      this.prependUserImagePaths(product.seller);
    });
  }

  prependUserImagePaths(user: User): void {
    if (
      path.basename(user.profileImageUrl) === ImageHelper.DEFAULT_PROFILE_IMAGE
    ) {
      user.profileImageUrl = path.join(
        AppInfo.publicUserImagesRelative,
        ImageHelper.DEFAULT_PROFILE_IMAGE
      );
    } else {
      const relativeUserImageFolder = this.getRelativeUserImageFolder(user);
      user.profileImageUrl = path.join(
        relativeUserImageFolder,
        user.profileImageUrl
      );
    }
  }
}
