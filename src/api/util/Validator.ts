import { SchemaMap, ObjectSchema, StringSchema, Schema } from "@hapi/joi";

export abstract class ValidationRuleBuilder {
  protected _schema: SchemaMap = {};
  build(): ObjectSchema {
    return Joi.object()
      .keys(this._schema)
      .unknown();
  }
  protected requiredString(): StringSchema {
    return Joi.string().required();
  }

  protected optionalString(): StringSchema {
    return Joi.string().allow("");
  }

  protected addRule(propertyName: string, rule: Schema): void {
    this._schema[propertyName] = rule;
  }
}

const Joi = require("@hapi/joi");
const DecimalExtension = require("joi-decimal");
export const validator = Joi.extend(DecimalExtension);
