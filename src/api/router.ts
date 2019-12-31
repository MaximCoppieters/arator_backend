import express = require("express");
import passport = require("passport");

// Controllers (route handlers)
import { UserController } from "./controllers/UserController";
import { ProductController } from "./controllers/ProductController";
import { OathController } from "./controllers/OathController";
import { ContactController } from "./controllers/ContactController";
// API keys and Passport configuration
import * as passportConfig from "./config/passport";
import { Service } from "typedi";

/**
 * Every request endpoint is prepended with /api
 * Sets up the application router endpoints
 */
@Service()
export default class ProjectRouter {
  private _expressRouter = express.Router();
  private jwtAuth = passport.authenticate("jwt", { session: false });

  constructor(
    private _userController: UserController,
    private _contactController: ContactController,
    private _oathController: OathController,
    private _productController: ProductController
  ) {
    this.setupEndpoints();
  }
  setupEndpoints() {
    this.setupUserController();
    this.setupProductController();
    this.setupOathController();
  }

  private setupUserController() {
    this._expressRouter
      .get("/user", this.jwtAuth, this._userController.getUserDetails)
      .post("/login", this._userController.postLogin)
      .post("/account/forgot", this._userController.postForgot)
      .get("/reset/:token", this._userController.getReset)
      .post("/reset/:token", this._userController.postReset)
      .post("/signup", this._userController.postSignup)
      .post("/contact", this._contactController.postContact)
      .post("/user/:id/review", this.jwtAuth, this._userController.postReview)
      .put("/user/settings", this.jwtAuth, this._userController.putUserSettings)
      .post("/user/address", this.jwtAuth, this._userController.postUserAddress)
      .post(
        "/account/profile",
        passportConfig.isAuthenticated,
        this._userController.postUpdateProfile
      )
      .post(
        "/account/password",
        passportConfig.isAuthenticated,
        this._userController.postUpdatePassword
      )
      .post(
        "/account/delete",
        passportConfig.isAuthenticated,
        this._userController.postDeleteAccount
      )
      .get("/users", this._userController.getAll)
      .get(
        "/account/unlink/:provider",
        passportConfig.isAuthenticated,
        this._userController.getOauthUnlink
      );
  }

  private setupOathController() {
    this._expressRouter
      .get(
        "/facebook",
        passportConfig.isAuthenticated,
        passportConfig.isAuthorized,
        this._oathController.getFacebook
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

  setupProductController() {
    this._expressRouter
      .get("/product", this._productController.getProductsInDistanceRange)
      .delete("/product", this._productController.delete)
      .get(
        "/product/personal",
        this.jwtAuth,
        this._productController.getPersonalProducts
      )
      .post("/product", this.jwtAuth, this._productController.post);
  }

  get expressRouter() {
    return this._expressRouter;
  }
}
