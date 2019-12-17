import Joi, { SchemaMap, object } from "@hapi/joi";
import { StringSchema, ObjectSchema } from "@hapi/joi";
import { Service } from "typedi";

class ValidationRuleBuilder {
  private _schema: SchemaMap = {};

  withEmail(): ValidationRuleBuilder {
    this.addRule(
      "email",
      Joi.string()
        .email({ minDomainSegments: 2 })
        .error(() => "Please enter a valid email")
    );
    return this;
  }
  withMessage(): ValidationRuleBuilder {
    this.addRule("message", this.requiredString());
    return this;
  }

  withName(): ValidationRuleBuilder {
    this.addRule(
      "name",
      this.requiredString().error(() => "Please fill in your name")
    );
    return this;
  }
  withPassword(): ValidationRuleBuilder {
    this.addRule(
      "password",
      this.requiredString()
        .min(6)
        .error(() => "Password is too short (min 6)")
    );
    return this;
  }
  withConfirmPassword(): ValidationRuleBuilder {
    this._schema["confirmPassword"] = Joi.ref("password");
    return this;
  }

  build(): ObjectSchema {
    return Joi.object().keys(this._schema);
  }
  private requiredString() {
    return Joi.string().required();
  }

  private addRule(propertyName: string, rule: StringSchema): void {
    this._schema[propertyName] = rule;
  }
}

@Service()
export class Validator {
  public validatePostContact(fields: Object) {
    const validationRules = new ValidationRuleBuilder()
      .withName()
      .withEmail()
      .withMessage()
      .build();

    return Joi.validate(fields, validationRules);
  }

  private confirmPasswordValidationRules(): ObjectSchema {
    return new ValidationRuleBuilder()
      .withName()
      .withEmail()
      .withPassword()
      .withConfirmPassword()
      .build();
  }

  public validatePostLogin(fields: Object) {
    const validationRules = new ValidationRuleBuilder()
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
    const validationRules = new ValidationRuleBuilder().build();

    return Joi.validate(fields, validationRules);
  }

  public validatePostUpdatePassword(fields: Object) {
    const validationRules = this.confirmPasswordValidationRules();
    return Joi.validate(fields, validationRules);
  }

  public validatePostForgotPassword(fields: Object) {
    const validationRules = new ValidationRuleBuilder().withEmail().build();

    return Joi.validate(fields, validationRules);
  }

  public validatePostResetToken(fields: Object) {
    const validationRules = this.confirmPasswordValidationRules();
    return Joi.validate(fields, validationRules);
  }
}
