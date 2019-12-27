import { User } from "./User";
import { Typegoose, prop } from "@hasezoey/typegoose";

export class UserSettings extends Typegoose {
  _id?: string;
  @prop({ required: true, default: 5 })
  maxProductDistance: number;
  @prop({ required: true, default: true })
  useGpsLocation: boolean;
}

export const UserSettingsModel = new UserSettings().getModelForClass(
  UserSettings
);
