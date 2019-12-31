import { Typegoose, prop, Ref, getModelForClass } from "@typegoose/typegoose";
import { User } from "./User";

export class UserReview {
  _id?: string;
  @prop({ required: true })
  comment: string;
  @prop({ required: true })
  rating: number;
  @prop({ required: true, ref: "User" })
  reviewer: Ref<User>;
  reviewedId: string;
}

export const UserReviewModel = getModelForClass(UserReview);
