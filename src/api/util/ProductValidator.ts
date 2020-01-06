import { ValidationRuleBuilder } from "./Validator";
import { Request, Response } from "express";
import { Service } from "typedi";
import Joi, { ValidationResult } from "@hapi/joi";
import { RequestHandler, NextFunction } from "express";
import { ObjectSchema } from "@hapi/joi";

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
export class ProductValidator {
  validateNewProduct = async (req: any, res: Response, next: NextFunction) => {
    req.body.imageUrl = req.files.image?.path;
    req.body.seller = req.user;
    const validationRules = this.newProductValidationRules();

    const { error } = Joi.validate(req.body, validationRules);

    if (error) {
      return res.status(400).json(error);
    }
    return next();
  };

  private newProductValidationRules(): ObjectSchema {
    return new ProductValidationRuleBuilder()
      .withName()
      .withImageUrl()
      .withType()
      .withPrice()
      .withAmount()
      .withDescription()
      .build();
  }
}
