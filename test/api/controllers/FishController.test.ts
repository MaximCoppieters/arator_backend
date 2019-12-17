import request from "supertest";
import app from "../../setup";

describe("GET /api/fish", () => {
  it("should return 200 OK", async () => {
    return request(await app)
      .get("/api/fish")
      .expect(200);
  });
});
