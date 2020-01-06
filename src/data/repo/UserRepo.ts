import { Service } from "typedi";
import { UserReview, UserReviewModel } from "../models/UserReview";
import { UserModel, User } from "../models/User";
import { UserSettingsModel, UserSettings } from "../models/UserSettings";
import { Address, AddressModel } from "../models/Address";

@Service()
export class UserRepo {
  async saveReview(review: UserReview): Promise<void> {
    UserReviewModel.create(review);
    const reviewed = await UserModel.findById(review.reviewedId);
    reviewed.addReview(review);
    reviewed.save();
  }

  async save(user: DocumentType): Promise<void> {
    try {
      await UserReviewModel.create(user);
    } catch (err) {
      throw new Error(err);
    }
  }

  async findByEmail(email: string): Promise<User> {
    return await UserModel.findOne({ email: email });
  }

  async updateSettings(userSettings: UserSettings): Promise<void> {
    UserSettingsModel.findByIdAndUpdate(userSettings._id, userSettings);
  }

  async getUserWithAddressAndSettings(userId: string): Promise<User> {
    const user = await UserModel.findById(userId)
      .populate("address")
      .populate("userSettings");
    user.password = undefined;
    return user;
  }

  async updateOrInsertAddress(address: Address): Promise<void> {
    try {
      await AddressModel.findByIdAndUpdate(address._id, address, {
        upsert: true,
      });
    } catch (error) {
      console.error(error);
    }
  }

  async getWithExpiringPasswordToken(passwordToken: string): Promise<User> {
    return UserModel.findOne({ passwordResetToken: passwordToken })
      .where("passwordResetExpires")
      .gt(Date.now());
  }
}
