import { Service } from "typedi";
import { RouterBase } from "./router";
import { Router } from "express";
import passport = require("passport");
import * as passportConfig from "../config/passport";
import { OathController } from "../controllers/OathController";

@Service()
export class OathRoutes implements RouterBase {
  constructor(private oathController: OathController) {}
  addRoutes(projectRouter: Router): void {
    projectRouter
      .get(
        "/facebook",
        passportConfig.isAuthenticated,
        passportConfig.isAuthorized,
        this.oathController.getFacebook
      )
      /**
       * OAuth authentication routes. (Sign in)
       */
      .get(
        "/auth/facebook",
        passport.authenticate("facebook", {
          scope: ["email", "public_profile"],
        })
      )
      .get(
        "/auth/facebook/callback",
        passport.authenticate("facebook", { failureRedirect: "/login" })
      );
  }
}
