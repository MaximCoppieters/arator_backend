import { Typegoose, prop, Ref, getModelForClass } from "@typegoose/typegoose";
import { User } from "./User";

export class UserReview {
  _id?: string;
  @prop()
  comment: string;
  @prop()
  rating: number;
  @prop({ ref: "User" })
  reviewer: Ref<User>;
  reviewedId: string;
}

export const UserReviewModel = getModelForClass(UserReview);
