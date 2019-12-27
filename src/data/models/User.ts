import bcrypt from "bcrypt-nodejs";
import mongoose from "mongoose";
import {
  prop,
  Typegoose,
  pre,
  Ref,
  arrayProp,
  instanceMethod,
  staticMethod,
  ModelType,
} from "@hasezoey/typegoose";
import { UserSettings, UserSettingsModel } from "./UserSettings";
import { ImageHelper } from "../../api/util/ImageHelper";
import { UserReview } from "./UserReview";
import { Address, AddressModel } from "./Address";

export type AuthToken = {
  accessToken: string;
  kind: string;
};

/**
 * Password hash middleware.
 */
@pre<User>("save", function save(next) {
  const user = this as User;
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, undefined, (err: mongoose.Error, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      const userSettings = new UserSettingsModel();
      userSettings.save();
      user.userSettings = userSettings;
      next();
    });
  });
})
export class User extends Typegoose {
  _id?: string;
  @prop()
  email: string;
  @prop({ required: true })
  name: string;
  @prop({ required: true })
  password: string;
  @prop()
  passwordResetToken: string;
  @prop()
  passwordResetExpired: Date;

  @prop({ default: ImageHelper.DEFAULT_PROFILE_IMAGE })
  profileImageUrl: string;
  @arrayProp({
    itemsRef: "UserReview",
  })
  reviews: Ref<UserReview>[];
  @prop({ default: 0 })
  averageRating: number;
  @prop({ default: 0 })
  ratingCount: number;

  @prop()
  about: string;

  @prop({
    required: true,
    ref: "UserSettings",
  })
  userSettings: Ref<UserSettings>;

  @prop({
    required: true,
    ref: "Address",
  })
  address: Ref<Address>;

  @prop()
  facebook: string;
  @prop()
  twitter: string;
  @prop()
  google: string;
  @prop()
  tokens: string[];

  @instanceMethod
  addReview(review: UserReview) {
    this.reviews.push(review);
    this.averageRating =
      (this.averageRating * this.ratingCount + review.rating) /
      (this.ratingCount + 1);
    this.ratingCount++;
  }
}

export const UserModel = new User().getModelForClass(User);
