import { RouterBase } from "./router";
import { Service } from "typedi";
import { ShoppingCartController } from "../controllers/ShoppingCartController";
import { jwtAuthValidator } from "./route_jwt_validator";
import { Router } from "express";

@Service()
export class ShoppingCartRouter implements RouterBase {
  constructor(private shoppingCartController: ShoppingCartController) {}

  addRoutes(router: Router): void {
    router
      .get(
        "/user/shoppingcart",
        jwtAuthValidator,
        this.shoppingCartController.getUserShoppingCart
      )
      .post(
        "/user/shoppingcart",
        jwtAuthValidator,
        this.shoppingCartController.postUserShoppingCart
      );
  }
}
