import { BodyMetrics, BodyMetricsModel } from "../models/BodyMetrics";
import { Service } from "typedi";

@Service()
export class BodyMetricsRepo {
  async getBodyMetrics(bodyMetrics: string): Promise<BodyMetrics> {
    return BodyMetricsModel.findById(bodyMetrics);
  }

  async updateBodyMetrics(bodyMetrics: BodyMetrics): Promise<void> {
    await BodyMetricsModel.findByIdAndUpdate(bodyMetrics._id, bodyMetrics, {
      upsert: true,
    });
  }
}
