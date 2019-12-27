import Joi, { ObjectSchema, options, ValidationResult } from "@hapi/joi";
import { Service } from "typedi";
import { ValidationRuleBuilder } from "./Validator";
import { Address } from "../../data/models/Address";

class AddressValidationRuleBuilder extends ValidationRuleBuilder {
  withAddressLine(): AddressValidationRuleBuilder {
    this.addRule(
      "addressLine",
      this.requiredString().error(() => "Please fill in an address")
    );
    return this;
  }
}

@Service()
export class UserAddressValidator {
  public validateNewUserAddress(fields: Object) {
    const validationRules = new AddressValidationRuleBuilder()
      .withAddressLine()
      .build();

    return Joi.validate(fields, validationRules);
  }
}
