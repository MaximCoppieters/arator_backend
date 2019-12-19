import passport from "passport";
import passportLocal from "passport-local";
import passportFacebook from "passport-facebook";
import _ from "lodash";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";

// import { User, UserType } from '../models/User';
import { UserModel, User } from "../../data/models/User";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt-nodejs";

const LocalStrategy = passportLocal.Strategy;
const FacebookStrategy = passportFacebook.Strategy;

passport.serializeUser<any, any>((user, done) => {
  done(undefined, user.id);
});

passport.deserializeUser((id, done) => {
  UserModel.findById(id, (err, user) => {
    done(err, user);
  });
});

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(opts, function(jwt_payload, done) {
    UserModel.findOne({ id: jwt_payload.sub }, function(err, user) {
      if (err) {
        return done(err, false);
      }
      if (user) {
        return done(undefined, user);
      } else {
        return done(undefined, false);
        // or you could create a new account
      }
    });
  })
);
/**
 * Sign in using Email and Password.
 */
passport.use(
  new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    UserModel.findOne({ email: email.toLowerCase() }, (err, user: User) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(undefined, false, {
          message: `Email ${email} not found.`,
        });
      }
      comparePassword(
        user.password,
        password,
        (err: Error, isMatch: boolean) => {
          if (err) {
            return done(err);
          }
          if (isMatch) {
            return done(undefined, user);
          }
          return done(undefined, false, {
            message: "Invalid email or password.",
          });
        }
      );
    });
  })
);

function comparePassword(
  actualPassword: string,
  candidatePassword: string,
  cb: Function
) {
  bcrypt.compare(
    candidatePassword,
    actualPassword,
    (err: any, isMatch: boolean) => {
      cb(err, isMatch);
    }
  );
}

/**
 * OAuth Strategy Overview
 *
 * - User is already logged in.
 *   - Check if there is an existing account with a provider id.
 *     - If there is, return an error message. (Account merging not supported)
 *     - Else link new OAuth account with currently logged-in user.
 * - User is not logged in.
 *   - Check if it's a returning user.
 *     - If returning user, sign in and we are done.
 *     - Else check if there is an existing account with user's email.
 *       - If there is, return an error message.
 *       - Else create a new account.
 */

/**
 * Sign in with Facebook.
 */
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
      callbackURL: "/auth/facebook/callback",
      profileFields: ["name", "email", "link", "locale", "timezone"],
      passReqToCallback: true,
    },
    (req: any, accessToken, refreshToken, profile, done) => {
      if (req.user) {
        UserModel.findOne({ facebook: profile.id }, (err, existingUser) => {
          if (err) {
            return done(err);
          }
          if (existingUser) {
            req.flash("errors", {
              msg:
                "There is already a Facebook account that belongs to you. Sign in with that account or delete it, then link it with your current account.",
            });
            done(err);
          } else {
            UserModel.findById(req.user.id, (err, user: any) => {
              if (err) {
                return done(err);
              }
              user.facebook = profile.id;
              user.tokens.push({ kind: "facebook", accessToken });
              user.profile.name =
                user.profile.name ||
                `${profile.name.givenName} ${profile.name.familyName}`;
              user.profile.gender = user.profile.gender || profile._json.gender;
              user.profile.picture =
                user.profile.picture ||
                `https://graph.facebook.com/${profile.id}/picture?type=large`;
              user.save((err: Error) => {
                req.flash("info", {
                  msg: "Facebook account has been linked.",
                });
                done(err, user);
              });
            });
          }
        });
      } else {
        UserModel.findOne({ facebook: profile.id }, (err, existingUser) => {
          if (err) {
            return done(err);
          }
          if (existingUser) {
            return done(undefined, existingUser);
          }
          UserModel.findOne(
            { email: profile._json.email },
            (err, existingEmailUser) => {
              if (err) {
                return done(err);
              }
              if (existingEmailUser) {
                req.flash("errors", {
                  msg:
                    "There is already an account using this email address. Sign in to that account and link it with Facebook manually from Account Settings.",
                });
                done(err);
              } else {
                const user: any = new UserModel();
                user.email = profile._json.email;
                user.facebook = profile.id;
                user.tokens.push({ kind: "facebook", accessToken });
                user.profile.name = `${profile.name.givenName} ${profile.name.familyName}`;
                user.profile.gender = profile._json.gender;
                user.profile.picture = `https://graph.facebook.com/${profile.id}/picture?type=large`;
                user.profile.location = profile._json.location
                  ? profile._json.location.name
                  : "";
                user.save((err: Error) => {
                  done(err, user);
                });
              }
            }
          );
        });
      }
    }
  )
);

/**
 * Login Required middleware.
 */
export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

/**
 * Authorization Required middleware.
 */
export const isAuthorized = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const provider = req.path.split("/").slice(-1)[0];

  if (_.find(req.body.tokens, { kind: provider })) {
    next();
  } else {
    res.redirect(`/auth/${provider}`);
  }
};
