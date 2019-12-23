import { Typegoose, prop, Ref } from "typegoose";
import { User } from "./User";

export class UserReview extends Typegoose {
  _id?: string;
  @prop({ required: true })
  comment: string;
  @prop({ required: true })
  rating: number;
  @prop({ required: true, ref: "User" })
  reviewer: Ref<User>;
}

export const UserReviewModel = new UserReview().getModelForClass(UserReview);
