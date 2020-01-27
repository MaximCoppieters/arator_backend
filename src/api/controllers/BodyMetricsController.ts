import { Service } from "typedi";
import { Request, Response } from "express";
import { UserModel, User } from "../../data/models/User";
import { BodyMetricsRepo } from "../../data/repo/BodyMetricsRepo";
import { BodyMetricsModel } from "../../data/models/BodyMetrics";

@Service()
export class BodyMetricsController {
  constructor(private bodyMetricsRepo: BodyMetricsRepo) {}

  /**
   * GET /api/user/bodymetrics
   */
  getUserBodyMetrics = async (req: Request, res: Response) => {
    const user = await UserModel.findById((<any>req.user)._id).populate(
      "bodyMetrics"
    );

    return res.json(user);
  };

  /**
   * POST /api/user/bodymetrics
   */
  postUserBodyMetrics = async (req: Request, res: Response) => {
    const bodyMetricsEntry: any = req.body;


    const bodyMetrics = new BodyMetricsModel(bodyMetricsEntry);
    try {
      await this.bodyMetricsRepo.updateBodyMetrics(bodyMetrics);
      return res.status(201).end();
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  };
}
