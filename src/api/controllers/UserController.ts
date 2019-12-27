import async from "async";
import crypto from "crypto";
import nodemailer from "nodemailer";
import passport from "passport";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";
import { WriteError } from "mongodb";
import "../config/passport";
import { UserValidator } from "../util/UserValidator";
import { Service } from "typedi";
import { User, UserModel, AuthToken } from "../../data/models/User";
import { ImageHelper } from "../util/ImageHelper";
import { UserReviewModel } from "../../data/models/UserReview";
import { ReviewValidator } from "../util/ReviewValidator";
import { UserSettingsValidator } from "../util/UserSettingsValidator";
import { UserSettingsModel } from "../../data/models/UserSettings";
import { UserAddressValidator } from "../util/AddressValidator";
import { AddressModel } from "../../data/models/Address";
import { GeoService } from "../../business/services/GeoService";
import { Typegoose } from "@hasezoey/typegoose";

@Service()
export class UserController {
  constructor(
    private userValidator: UserValidator,
    private imageHelper: ImageHelper,
    private reviewValidator: ReviewValidator,
    private userSettingsValidator: UserSettingsValidator,
    private userAddressValidator: UserAddressValidator,
    private geoService: GeoService
  ) {}

  /**
   * GET /api/user
   * Get user details from jwttoken
   */
  getUserDetails = async (req: Request, res: Response, next: NextFunction) => {
    const user: any = req.user;
    user.password = undefined;
    this.imageHelper.prependUserImagePaths(user);
    return res.status(200).json(user);
  };

  /**
   * POST /api/user/{id}/review
   * Add review to user with target id
   */
  postReview = async (req: Request, res: Response, next: NextFunction) => {
    const user: any = req.user;
    const review = new UserReviewModel({
      comment: req.body.comment,
      rating: req.body.rating,
      reviewer: user._id,
    });
    const { error } = this.reviewValidator.validateNewReview(review);
    if (error) {
      return res.status(400).json(error);
    }

    try {
      await review.save();
      const reviewed = await UserModel.findById(req.params.id);
      reviewed.addReview(review);
      reviewed.save();

      return res.status(201).json({ _id: review._id });
    } catch (err) {
      return res.status(400).json(err);
    }
  };

  // TODO: remove this endpoint
  getUserReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reviews = await UserReviewModel.find()
        .populate("reviewer")
        .exec();
      return res.status(201).json(reviews);
    } catch (err) {
      return res.status(400).json(err);
    }
  };

  /**
   * POST /api/login
   * Sign in using email and password.
   */
  postLogin = (req: Request, res: Response, next: NextFunction) => {
    const { error } = this.userValidator.validatePostLogin(req.body);
    if (error) {
      return res.status(400).json(error);
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
    const { error } = this.userValidator.validatePostSignup(req.body);

    if (error) {
      return res.status(400).json({ error });
    }

    const user = new UserModel(req.body);

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

  // TODO: Remove endpoint
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    const users = await UserModel.find()
      .populate("reviews")
      .populate("userSettings")
      .populate("address")
      .exec();
    return res.json(users);
  };

  /**
   * PUT /api/user/settings
   * Update profile information.
   */
  putUserSettings = async (req: Request, res: Response, next: NextFunction) => {
    const { error } = this.userSettingsValidator.validateUserSettings(req.body);
    if (error) {
      return res.status(400).json(error);
    }
    const userSettings = new UserSettingsModel(req.body);

    try {
      UserSettingsModel.findByIdAndUpdate(userSettings._id, userSettings);
    } catch (error) {
      return res.status(400).json(error);
    }
    return res.status(200).end();
  };

  /**
   * POST /api/user/address
   * Change User Address.
   */
  postUserAddress = async (req: Request, res: Response, next: NextFunction) => {
    const { error } = this.userAddressValidator.validateNewUserAddress(
      req.body
    );
    if (error) {
      return res.status(400).json(error);
    }

    try {
      const addressEntry: any = await this.geoService.geocode(
        req.body.addressLine
      );
      const address = new AddressModel(addressEntry);
      address.save();
      const user: any = req.user;
      user.address = address;
      UserModel.findByIdAndUpdate(user._id, user as User);
      return res.status(201).end();
    } catch (error) {
      console.log(error);
      return res.status(400).send(error);
    }
  };

  /**
   * POST /api/account/profile
   * Update profile information.
   */
  postUpdateProfile = (req: Request, res: Response, next: NextFunction) => {
    const { error } = this.userValidator.validatePostUpdateProfile(req.body);

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
    const { error } = this.userValidator.validatePostUpdatePassword(req.body);

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
    const { error } = this.userValidator.validatePostForgotPassword(req.body);

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
    const { error } = this.userValidator.validatePostForgotPassword(req.body);

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
