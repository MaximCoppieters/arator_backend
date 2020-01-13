import express = require("express");
import passport = require("passport");

// Controllers (route handlers)
import { UserController } from "../controllers/UserController";
import { ProductController } from "../controllers/ProductController";
import { OathController } from "../controllers/OathController";
import { ContactController } from "../controllers/ContactController";
import * as passportConfig from "../config/passport";
import { Service } from "typedi";
import { UserRouter } from "./user_router";
import { Router } from "express";
import { OathRoutes } from "./oath_router";
import { ProductRouter } from "./product_router";
import { ContactRouter } from "./contact_router";
import { ShoppingCartRouter } from "./shopping_cart_router";

export interface RouterBase {
  addRoutes(projectRouter: Router): void;
}

/**
 * Every request endpoint is prepended with /api
 * Sets up the application router endpoints
 */
@Service()
export default class ProjectRouter {
  private _expressRouter = express.Router();
  private jwtAuth = passport.authenticate("jwt", { session: false });

  constructor(
    private userRouter: UserRouter,
    private productRouter: ProductRouter,
    private oathRouter: OathRoutes,
    private contactRouter: ContactRouter,
    private shoppingCartRouter: ShoppingCartRouter
  ) {
    this.setupEndpoints();
  }
  setupEndpoints() {
    this.userRouter.addRoutes(this.expressRouter);
    this.productRouter.addRoutes(this.expressRouter);
    this.oathRouter.addRoutes(this.expressRouter);
    this.contactRouter.addRoutes(this._expressRouter);
    this.shoppingCartRouter.addRoutes(this._expressRouter);
  }

  get expressRouter() {
    return this._expressRouter;
  }
}
