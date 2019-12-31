import { ValidationRuleBuilder, RequestValidator } from "./Validator";
import { Service } from "typedi";
import Joi from "@hapi/joi";
import { RequestHandler } from "express";

class ProductValidationRuleBuilder extends ValidationRuleBuilder {
  static readonly MIN_PRICE = 0.0;
  static readonly MAX_DESCRIPTION_LENGTH = 250;
  static readonly MAX_NAME_TYPE_LENGTH = 30;
  withPrice(): ProductValidationRuleBuilder {
    this.addRule(
      "priceInEuro",
      Joi.number()
        .min(ProductValidationRuleBuilder.MIN_PRICE)
        .error(
          () => `Price greater than ${ProductValidationRuleBuilder.MIN_PRICE}`
        )
    );
    return this;
  }
  withAmount(): ProductValidationRuleBuilder {
    this.addRule(
      "amount",
      Joi.number()
        .min(1)
        .error(() => "Amount greater than 0")
    );
    return this;
  }
  withDescription(): ProductValidationRuleBuilder {
    this.addRule(
      "description",
      this.optionalString().max(
        ProductValidationRuleBuilder.MAX_DESCRIPTION_LENGTH
      )
    );
    return this;
  }
  withName(): ProductValidationRuleBuilder {
    this.addRule(
      "name",
      this.requiredString().max(
        ProductValidationRuleBuilder.MAX_NAME_TYPE_LENGTH
      )
    );
    return this;
  }
  withImageUrl(): ProductValidationRuleBuilder {
    this.addRule(
      "imageUrl",
      this.requiredString().error(() => "Please select an image")
    );
    return this;
  }
  withType(): ProductValidationRuleBuilder {
    this.addRule(
      "type",
      this.requiredString().max(
        ProductValidationRuleBuilder.MAX_NAME_TYPE_LENGTH
      )
    );
    return this;
  }
}

@Service()
export class ProductValidator extends RequestValidator {
  public validateNewProduct(fields: Object): RequestHandler {
    const validationRules = new ProductValidationRuleBuilder()
      .withName()
      .withImageUrl()
      .withType()
      .withPrice()
      .withAmount()
      .withDescription()
      .build();

    return this.validator.query(validationRules);
  }
}
