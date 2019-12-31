import { Service } from "typedi";
import { RouterBase } from "./router";
import { ProductController } from "../controllers/ProductController";
import { Router } from "express";
import { jwtAuthValidator } from "./route_jwt_validator";

@Service()
export class ProductRouter implements RouterBase {
  constructor(private productController: ProductController) {}

  addRoutes(router: Router): void {
    router
      .get("/product", this.productController.getProductsInDistanceRange)
      .delete("/product", this.productController.delete)
      .get(
        "/product/personal",
        jwtAuthValidator,
        this.productController.getPersonalProducts
      )
      .post("/product", jwtAuthValidator, this.productController.post);
  }
}
