import { User } from "./User";
import { getModelForClass, Typegoose, prop } from "@typegoose/typegoose";

export class UserSettings {
  _id?: string;
  @prop({ required: true, default: 5 })
  maxProductDistance: number;
  @prop({ required: true, default: true })
  useGpsLocation: boolean;
}

export const UserSettingsModel = getModelForClass(UserSettings);
