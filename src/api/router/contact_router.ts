import { Service } from "typedi";
import { ContactController } from "../controllers/ContactController";
import { RouterBase } from "./router";
import { Router } from "express";

@Service()
export class ContactRouter implements RouterBase {
  constructor(private _contactController: ContactController) {}

  addRoutes(projectRouter: Router): void {
    projectRouter.post("/contact", this._contactController.postContact);
  }
}
