import { ValidationRuleBuilder } from "./Validator";
import Joi from "@hapi/joi";
import { Service } from "typedi";

class ShoppingCartValidationRuleBuilder extends ValidationRuleBuilder {
  withProductDistance(): ShoppingCartValidationRuleBuilder {
    this.addRule(
      "amountByProductId",
      Joi.object()
        .required()
        .error(() => "Cart products missing")
    );
    return this;
  }
}

@Service()
export class ShoppingCartValidator {
  public validateShoppingCart(fields: Object) {
    const validationRules = new ShoppingCartValidationRuleBuilder()
      .withProductDistance()
      .build();

    return Joi.validate(fields, validationRules);
  }
}
