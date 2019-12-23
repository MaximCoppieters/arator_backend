import bcrypt from "bcrypt-nodejs";
import mongoose from "mongoose";
import { prop, Typegoose, ModelType, InstanceType, pre } from "typegoose";
import { ImageHelper } from "../../api/util/ImageHelper";
import { Review } from "./Review";

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
  @prop({ default: [] })
  reviews: Review[];

  @prop()
  about: string;

  @prop()
  facebook: string;
  @prop()
  twitter: string;
  @prop()
  google: string;
  @prop()
  tokens: string[];
}

export const UserModel = new User().getModelForClass(User);
