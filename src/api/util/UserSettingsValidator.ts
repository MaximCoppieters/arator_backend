import Joi, { ObjectSchema } from "@hapi/joi";
import { Service } from "typedi";
import { ValidationRuleBuilder } from "./Validator";

class UserSettingsValidationRuleBuilder extends ValidationRuleBuilder {
  static readonly MIN_PRODUCT_DISTANCE = 0;
  static readonly MAX_PRODUCT_DISTANCE = 100;
  withProductDistance(): UserSettingsValidationRuleBuilder {
    this.addRule(
      "maxProductDistance",
      Joi.number()
        .required()
        .min(UserSettingsValidationRuleBuilder.MIN_PRODUCT_DISTANCE)
        .max(UserSettingsValidationRuleBuilder.MAX_PRODUCT_DISTANCE)
        .error(() => "Product distance is not valid")
    );
    return this;
  }

  withGpsLocation(): UserSettingsValidationRuleBuilder {
    const field = "useGpsLocation";
    this.addRule(
      field,
      Joi.bool()
        .required()
        .error(() => `${field} should be a boolean`)
    );
    return this;
  }
}

@Service()
export class UserSettingsValidator {
  public validateUserSettings(fields: Object) {
    const validationRules = new UserSettingsValidationRuleBuilder()
      .withProductDistance()
      .build();

    return Joi.validate(fields, validationRules);
  }
}
