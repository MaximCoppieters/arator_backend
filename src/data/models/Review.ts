import { Typegoose, prop } from "typegoose";
import { User } from "./User";

export class Review extends Typegoose {
  _id?: string;
  @prop({ required: true })
  comment: string;
  @prop({ required: true })
  rating: number;
  @prop({ required: true })
  reviewer: User;
}
