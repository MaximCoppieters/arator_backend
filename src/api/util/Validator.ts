import { SchemaMap, ObjectSchema, StringSchema, Schema } from "@hapi/joi";
import Joi from "@hapi/joi";
import { Service } from "typedi";

export abstract class ValidationRuleBuilder {
  protected schema: SchemaMap = {};
  build(): ObjectSchema {
    return Joi.object()
      .keys(this.schema)
      .unknown();
  }
  protected requiredString(): StringSchema {
    return Joi.string().required();
  }

  protected optionalString(): StringSchema {
    return Joi.string().allow("");
  }

  protected addRule(propertyName: string, rule: Schema): void {
    this.schema[propertyName] = rule;
  }
}
