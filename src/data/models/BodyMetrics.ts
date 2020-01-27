import { prop, getModelForClass, Ref } from "@typegoose/typegoose";
import { User } from "./User";

enum Gender {
  MALE = "Male",
  FEMALE = "Female",
}

export class BodyMetrics {
  _id?: string;
  @prop()
  weight: number;
  @prop()
  age: number;
  @prop()
  bmi: number;
  @prop({ enum: Gender })
  gender: string;
  @prop({
    ref: "User",
  })
  user: Ref<User>;
}

export const BodyMetricsModel = getModelForClass(BodyMetrics);
