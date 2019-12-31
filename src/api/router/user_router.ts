import { UserController } from "../controllers/UserController";
import { Router } from "express";
import * as passportConfig from "../config/passport";
import { jwtAuthValidator } from "./route_jwt_validator";
import { Service } from "typedi";
import { RouterBase } from "./router";

@Service()
export class UserRouter implements RouterBase {
  constructor(private _userController: UserController) {}

  addRoutes(projectRouter: Router): void {
    projectRouter
      .get("/user", jwtAuthValidator, this._userController.getUserDetails)
      .post("/login", this._userController.postLogin)
      .post("/account/forgot", this._userController.postForgot)
      .get("/reset/:token", this._userController.getReset)
      .post("/reset/:token", this._userController.postReset)
      .post("/signup", this._userController.postSignup)
      .post(
        "/user/:id/review",
        jwtAuthValidator,
        this._userController.postReview
      )
      .put(
        "/user/settings",
        jwtAuthValidator,
        this._userController.putUserSettings
      )
      .post(
        "/user/address",
        jwtAuthValidator,
        this._userController.postUserAddress
      )
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
}
