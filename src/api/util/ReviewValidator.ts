import { ValidationRuleBuilder } from "./Validator";
import { Service } from "typedi";
import Joi from "@hapi/joi";
import { json } from "body-parser";

class ReviewValidationRuleBuilder extends ValidationRuleBuilder {
  withRating(): ReviewValidationRuleBuilder {
    this.addRule(
      "rating",
      Joi.number()
        .integer()
        .min(0)
        .max(5)
        .error(() => "Rating must be between 0 and 5")
    );
    return this;
  }
  withComment(): ReviewValidationRuleBuilder {
    this.addRule(
      "comment",
      Joi.string()
        .max(300)
        .error(() => "Review can't be longer than 300 characters")
    );
    return this;
  }
  withDifferentReviewedAndReviewer(): ReviewValidationRuleBuilder {
    this.addRule(
      "reviewerId",
      Joi.string()
        .invalid(Joi.ref("reviewedId"))
        .error(() => "You can't review yourself")
    );
    return this;
  }
}

@Service()
export class ReviewValidator {
  public validateNewReview(fields: Object) {
    const validationRules = new ReviewValidationRuleBuilder()
      .withRating()
      .withComment()
      .withDifferentReviewedAndReviewer()
      .build();

    return Joi.validate(fields, validationRules);
  }
}
