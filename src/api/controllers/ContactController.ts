import nodemailer from "nodemailer";
import { Request, Response } from "express";
import { Validator } from "../util/ValidationRuleBuilder";
import { Service } from "typedi";

const transporter = nodemailer.createTransport({
  service: "SendGrid",
  auth: {
    user: process.env.SENDGRID_USER,
    pass: process.env.SENDGRID_PASSWORD,
  },
});

@Service()
export class ContactController {
  private validator: Validator;

  constructor(validator: Validator) {
    this.validator = validator;
  }

  /**
   * POST /api/contact
   * Send a contact form via Nodemailer.
   */
  postContact = (req: Request, res: Response) => {
    const result = this.validator.validatePostContact(req.body);

    if (result.error) {
      return res.status(400).json({ message: result.error.message });
    }

    const mailOptions = {
      to: "maximcoppieters@gmail.com",
      from: `${req.body.name} <${req.body.email}>`,
      subject: "Contact Form",
      text: req.body.message,
    };

    transporter.sendMail(mailOptions, err => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      res.status(200).end();
    });
  };
}
