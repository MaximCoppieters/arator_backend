import { Service } from "typedi";
import passport = require("passport");

export const jwtAuthValidator = passport.authenticate("jwt", {
  session: false,
});
