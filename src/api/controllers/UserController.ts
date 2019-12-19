import async from "async";
import crypto from "crypto";
import nodemailer from "nodemailer";
import passport from "passport";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";
import { WriteError } from "mongodb";
import "../config/passport";
import { Validator } from "../util/ValidationRuleBuilder";
import { Service } from "typedi";
import { User, UserModel, AuthToken } from "../../data/models/User";
import { json } from "body-parser";

@Service()
export class UserController {
  constructor(private validator: Validator) {}
  /**
   * POST /api/login
   * Sign in using email and password.
   */
  postLogin = (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    const { error } = this.validator.validatePostLogin(req.body);
    if (error) {
      return res.status(400).send(error);
    }

    passport.authenticate(
      "local",
      { session: false },
      (err: Error, user: User, info: IVerifyOptions) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(400).json({ message: info.message });
        }
        req.logIn(user, { session: false }, err => {
          if (err) {
            return next(err);
          }

          const token = jwt.sign(
            JSON.parse(JSON.stringify(user)),
            process.env.JWT_SECRET
          );
          return res.status(200).json({ token });
        });
      }
    )(req, res, next);
  };

  /**
   * POST /api/signup
   * Create a new local account.
   */
  postSignup = (req: Request, res: Response, next: NextFunction) => {
    const { error } = this.validator.validatePostSignup(req.body);

    if (error) {
      return res.status(400).json({ error });
    }
    const user = new UserModel({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    UserModel.findOne({ email: req.body.email }, (err, existingUser) => {
      if (err) {
        return next(err);
      }
      if (existingUser) {
        return res.status(400).json({ message: "Email is already in use" });
      }
      user.save((err: any) => {
        if (err) {
          return next(err);
        }
        req.logIn(user, err => {
          if (err) {
            return next(err);
          }
          return res.status(201).end();
        });
      });
    });
  };

  async getAll(req: Request, res: Response, next: NextFunction) {
    const users = await UserModel.find();
    return res.json(users);
  }

  /**
   * POST /api/account/profile
   * Update profile information.
   */
  postUpdateProfile = (req: Request, res: Response, next: NextFunction) => {
    const { error } = this.validator.validatePostUpdateProfile(req.body);

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    UserModel.findById(req.body.id, (err: any, user: User) => {
      if (err) {
        return next(err);
      }
      user.email = req.body.email || "";
      UserModel.create((err: WriteError) => {
        if (err) {
          if (err.code === 11000) {
            return res.status(400).json({
              message:
                "The email address you have entered is already associated with an account.",
            });
          }
          return next(err);
        }
        return res.status(201).end();
      });
    });
  };

  /**
   * POST /api/account/password
   * Update current password.
   */
  postUpdatePassword = (req: Request, res: Response, next: NextFunction) => {
    const { error } = this.validator.validatePostUpdatePassword(req.body);

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    UserModel.findById(req.body.id, (err: any, user: User) => {
      if (err) {
        return next(err);
      }
      user.password = req.body.password;
      UserModel.create((err: WriteError) => {
        if (err) {
          return next(err);
        }
        return res.status(201).end();
      });
    });
  };

  /**
   * POST /api/account/delete
   * Delete user account.
   */
  postDeleteAccount = (req: Request, res: Response, next: NextFunction) => {
    UserModel.remove({ _id: req.body.id }, (err: any) => {
      if (err) {
        return next(err);
      }
      req.logout();
      return res.status(200).end();
    });
  };

  /**
   * GET /api/account/unlink/:provider
   * Unlink OAuth provider.
   */
  getOauthUnlink = (req: Request, res: Response, next: NextFunction) => {
    const provider = req.params.provider;
    UserModel.findById(req.body.id, (err: any, user: any) => {
      if (err) {
        return next(err);
      }
      user[provider] = undefined;
      user.tokens = user.tokens.filter(
        (token: AuthToken) => token.kind !== provider
      );
      user.save((err: WriteError) => {
        if (err) {
          return next(err);
        }
        return res.status(200).end();
      });
    });
  };

  /**
   * GET /api/reset/:token
   * Reset Password page.
   */
  getReset = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
      return res.status(400).json({
        message: "Already signed in",
      });
    }
    UserModel.findOne({ passwordResetToken: req.params.token })
      .where("passwordResetExpires")
      .gt(Date.now())
      .exec((err: any, user: User) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(403).json({
            message: "Password reset token is invalid or has expired.",
          });
        }
        return res.status(200).end();
      });
  };

  /**
   * POST /api/reset/:token
   * Process the reset password request.
   */
  postReset = (req: Request, res: Response, next: NextFunction) => {
    const { error } = this.validator.validatePostForgotPassword(req.body);

    if (error) {
      return res.status(400).json({ errors: error.message });
    }

    async.waterfall(
      [
        function resetPassword(done: Function) {
          UserModel.findOne({ passwordResetToken: req.params.token })
            .where("passwordResetExpires")
            .gt(Date.now())
            .exec((err: any, user: any) => {
              if (err) {
                return next(err);
              }
              if (!user) {
                return res.status(403).json({
                  message: "Password reset token is invalid or has expired.",
                });
              }
              user.password = req.body.password;
              user.passwordResetToken = undefined;
              user.passwordResetExpires = undefined;
              user.save((err: WriteError) => {
                if (err) {
                  return next(err);
                }
                req.logIn(user, err => {
                  done(err, user);
                });
              });
            });
        },
        function sendResetPasswordEmail(user: User, done: Function) {
          const transporter = nodemailer.createTransport({
            service: "SendGrid",
            auth: {
              user: process.env.SENDGRID_USER,
              pass: process.env.SENDGRID_PASSWORD,
            },
          });
          const mailOptions = {
            to: user.email,
            from: "express-ts@starter.com",
            subject: "Your password has been changed",
            text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`,
          };
          transporter.sendMail(mailOptions, err => {
            req.flash("success", {
              msg: "Success! Your password has been changed.",
            });
            done(err);
          });
        },
      ],
      err => {
        if (err) {
          return next(err);
        }
        res.status(201).end();
      }
    );
  };

  /**
   * POST /forgot
   * Create a random token, then the send user an email with a reset link.
   */
  postForgot = (req: Request, res: Response, next: NextFunction) => {
    const { error } = this.validator.validatePostForgotPassword(req.body);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    async.waterfall(
      [
        function createRandomToken(done: Function) {
          crypto.randomBytes(16, (err, buf) => {
            const token = buf.toString("hex");
            done(err, token);
          });
        },
        function setRandomToken(token: AuthToken, done: Function) {
          UserModel.findOne(
            { email: req.body.email },
            (err: any, user: any) => {
              if (err) {
                return done(err);
              }
              if (!user) {
                return res.status(400).json({
                  message: "Account with that email address does not exist.",
                });
              }
              user.passwordResetToken = token;
              user.passwordResetExpires = Date.now() + 3600000; // 1 hour
              user.save((err: WriteError) => {
                done(err, token, user);
              });
            }
          );
        },
        function sendForgotPasswordEmail(
          token: AuthToken,
          user: User,
          done: Function
        ) {
          const transporter = nodemailer.createTransport({
            service: "SendGrid",
            auth: {
              user: process.env.SENDGRID_USER,
              pass: process.env.SENDGRID_PASSWORD,
            },
          });
          const mailOptions = {
            to: user.email,
            from: "hackathon@starter.com",
            subject: "Reset your password on Hackathon Starter",
            text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
            Please click on the following link, or paste this into your browser to complete the process:\n\n
            http://${req.headers.host}/reset/${token}\n\n
            If you did not request this, please ignore this email and your password will remain unchanged.\n`,
          };
          transporter.sendMail(mailOptions, err => {
            done(err);
          });
        },
      ],
      err => {
        if (err) {
          return next(err);
        }
        return res.status(200).end();
      }
    );
  };
}
