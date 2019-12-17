import request from "supertest";
import sinon from "sinon";
import { UserController } from "../../../src/api/controllers/UserController";
import { Request, NextFunction } from "express";
import Container from "typedi";
import app from "../../setup";

const chai = require("chai");
const expect = chai.expect;

describe("POST /api/login", () => {
  const userController = Container.get(UserController);

  it("with invalid user should return some defined error message with valid parameters", async (done: any) => {
    const result = await request(await app)
      .post("/api/login")
      .field("email", "john@me.com")
      .field("password", "Hunter2")
      .expect(400);

    expect(result.error).not.to.be.undefined;
    expect(result.body.message).to.be.a("string");
    done();
  });

  it("Should render json once", (done: any) => {
    const request = {} as Request;
    const responseMock = mockResponse();

    const nextFunctionMock = sinon.stub();
    userController.postLogin(
      request,
      responseMock,
      nextFunctionMock as NextFunction
    );
    expect(responseMock.status).calledOnce;
    done();
  });

  function mockResponse() {
    const res: any = {};
    res.status = sinon.stub().returns(res);
    res.render = sinon.stub().returns(res);
    return res;
  }
});
