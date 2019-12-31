"use strict";

import graph from "fbgraph";
import { Response, Request, NextFunction } from "express";
import { Service } from "typedi";

@Service()
export class OathController {
  /**
   * GET /api/facebook
   * Facebook API example.
   */
  getFacebook = (req: Request, res: Response, next: NextFunction) => {
    const token = req.body.tokens.find(
      (token: any) => token.kind === "facebook"
    );
    graph.setAccessToken(token.accessToken);
    graph.get(
      `${req.body.facebook}?fields=id,name,email,first_name,last_name,link,locale,timezone`,
      (err: Error, results: graph.FacebookUser) => {
        if (err) {
          return next(err);
        }
        res.json({
          title: "Facebook API",
          profile: results,
        });
      }
    );
  };
}
