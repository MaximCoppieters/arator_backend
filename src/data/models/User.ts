import bcrypt from "bcrypt-nodejs";
import crypto from "crypto";
import mongoose from "mongoose";
import {
  createSchema,
  Type,
  typedModel,
  ExtractDoc,
  ExtractProps,
} from "ts-mongoose";

export interface UserDocument extends mongoose.Document {
  email: string;
  password: string;
  passwordResetToken: string;
  passwordResetExpires: Date;

  facebook: string;
  tokens: AuthToken[];

  profile: {
    name: string;
    location: string;
    picture: string;
  };

  comparePassword: comparePasswordFunction;
}

type comparePasswordFunction = (
  candidatePassword: string,
  cb: (err: any, isMatch: any) => {}
) => void;

export type AuthToken = {
  accessToken: string;
  kind: string;
};

const userSchema = createSchema(
  {
    email: { type: String, unique: true },
    name: String,
    password: String,
    passwordResetToken: String,
    passwordResetExpires: Date,

    profileImageUrl: String,
    about: String,

    facebook: String,
    twitter: String,
    google: String,
    tokens: Array,

    profile: {
      name: String,
      location: String,
      picture: String,
    },
  },
  { timestamps: true }
);

/**
 * Password hash middleware.
 */
userSchema.pre("save", function save(next) {
  const user = this as UserDocument;
  if (!user.isModified("password")) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, undefined, (err: mongoose.Error, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

const comparePassword: comparePasswordFunction = function(
  candidatePassword,
  cb
) {
  bcrypt.compare(
    candidatePassword,
    this.password,
    (err: mongoose.Error, isMatch: boolean) => {
      cb(err, isMatch);
    }
  );
};

userSchema.methods.comparePassword = comparePassword;

export const User = typedModel("User", userSchema);
