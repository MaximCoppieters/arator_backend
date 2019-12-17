import "reflect-metadata";
import express from "express";
import compression from "compression"; // compresses requests
import bodyParser from "body-parser";
import lusca from "lusca";
import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import passport from "passport";
import bluebird from "bluebird";
import { MONGODB_URI } from "./api/util/secrets";
import ProjectRouter from "./api/router";
import { Container, Service } from "typedi";
import { getDatabaseClient } from "./data/db_client";

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: ".env" });

const app = express();

// Connect to MongoDB
const mongoUrl = MONGODB_URI;
(<any>mongoose).Promise = bluebird;

export async function setup() {
  const dbClient = await getDatabaseClient(mongoUrl);
  Container.set("dbClient", dbClient);
  // dbClient.connection.db.dropDatabase();

  // Express configuration
  app.set("port", process.env.PORT || 4000);

  app.set("view engine", "json");
  app.use(compression());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(lusca.xframe("SAMEORIGIN"));
  app.use(lusca.xssProtection(true));
  app.use(bodyParser.json());
  app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
  });

  app.use(
    express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
  );
  console.log(path.join(__dirname, "public"));

  const projectRouter: ProjectRouter = Container.get(ProjectRouter);
  app.use("/api", projectRouter.expressRouter);

  return app;
}
