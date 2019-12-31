import Joi, { SchemaMap, object } from "@hapi/joi";
import { StringSchema, ObjectSchema } from "@hapi/joi";
import { Service } from "typedi";
import { ValidationRuleBuilder } from "./Validator";
import { UserSettingsValidator } from "./UserSettingsValidator";
import { UserAddressValidator } from "./AddressValidator";
import { ReviewValidator } from "./ReviewValidator";

class UserValidationRuleBuilder extends ValidationRuleBuilder {
  withEmail(): UserValidationRuleBuilder {
    this.addRule(
      "email",
      Joi.string()
        .email({ minDomainSegments: 2 })
        .error(() => "Please enter a valid email")
    );
    return this;
  }
  withMessage(): UserValidationRuleBuilder {
    this.addRule("message", this.requiredString());
    return this;
  }
  withName(): UserValidationRuleBuilder {
    this.addRule(
      "name",
      this.requiredString().error(() => "Please fill in your name")
    );
    return this;
  }
  withPassword(): UserValidationRuleBuilder {
    this.addRule(
      "password",
      this.requiredString()
        .min(6)
        .error(() => "Password is too short (min 6)")
    );
    return this;
  }
  withConfirmPassword(): UserValidationRuleBuilder {
    this.schema["confirmPassword"] = Joi.ref("password");
    return this;
  }
}

@Service()
export class UserValidator {
  constructor(
    private userSettingsValidator: UserSettingsValidator,
    private addressValidator: UserAddressValidator,
    private reviewValidator: ReviewValidator
  ) {}

  public validatePostContact(fields: Object) {
    const validationRules = new UserValidationRuleBuilder()
      .withName()
      .withEmail()
      .withMessage()
      .build();

    return Joi.validate(fields, validationRules);
  }

  private confirmPasswordValidationRules(): ObjectSchema {
    return new UserValidationRuleBuilder()
      .withName()
      .withEmail()
      .withPassword()
      .withConfirmPassword()
      .build();
  }

  public validatePostLogin(fields: Object) {
    const validationRules = new UserValidationRuleBuilder()
      .withEmail()
      .withPassword()
      .build();

    return Joi.validate(fields, validationRules);
  }
  public validatePostSignup(fields: Object) {
    const validationRules = this.confirmPasswordValidationRules();
    return Joi.validate(fields, validationRules);
  }

  public validatePostUpdateProfile(fields: Object) {
    const validationRules = new UserValidationRuleBuilder().build();

    return Joi.validate(fields, validationRules);
  }

  public validatePostUpdatePassword(fields: Object) {
    const validationRules = this.confirmPasswordValidationRules();
    return Joi.validate(fields, validationRules);
  }

  public validatePostForgotPassword(fields: Object) {
    const validationRules = new UserValidationRuleBuilder().withEmail().build();

    return Joi.validate(fields, validationRules);
  }

  public validatePostResetToken(fields: Object) {
    const validationRules = this.confirmPasswordValidationRules();
    return Joi.validate(fields, validationRules);
  }

  public validateNewReview(fields: Object) {
    return this.reviewValidator.validateNewReview(fields);
  }

  public validateNewUserAddress(fields: Object) {
    return this.addressValidator.validateNewUserAddress(fields);
  }

  public validateUserSettings(fields: Object) {
    return this.userSettingsValidator.validateUserSettings(fields);
  }
}
