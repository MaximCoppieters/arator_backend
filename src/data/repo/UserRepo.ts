import { Service } from "typedi";
import { UserReview, UserReviewModel } from "../models/UserReview";
import { UserModel, User } from "../models/User";

@Service()
export class UserRepo {
  async saveReview(review: UserReview): Promise<void> {
    UserReviewModel.create(review);
    const reviewed = await UserModel.findById(review.reviewedId);
    reviewed.addReview(review);
    await reviewed.save();
  }

  async save(user: User): Promise<void> {
    await UserReviewModel.create(user);
  }
}
