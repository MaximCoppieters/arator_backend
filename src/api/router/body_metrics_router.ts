import { Service } from "typedi";
import { RouterBase } from "./router";
import { BodyMetricsController } from "../controllers/BodyMetricsController";
import { Router } from "express";
import { jwtAuthValidator } from "./route_jwt_validator";

@Service()
export class BodyMetricsRouter implements RouterBase {
  constructor(private _bodyMetricsController: BodyMetricsController) {}

  addRoutes(projectRouter: Router): void {
    projectRouter
      .post(
        "/user/bodymetrics",
        jwtAuthValidator,
        this._bodyMetricsController.postUserBodyMetrics
      )
      .get(
        "/user/bodymetrics",
        jwtAuthValidator,
        this._bodyMetricsController.getUserBodyMetrics
      );
  }
}
