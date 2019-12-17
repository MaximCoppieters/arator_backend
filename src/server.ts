import errorHandler from "errorhandler";
import { Container, Service } from "typedi";

import { setup } from "./app";

setup().then(app => {
  app.use(errorHandler());

  /**
   * Start Express server.
   */
  const server = app.listen(app.get("port"), () => {
    console.log(
      "  App is running at http://localhost:%d in %s mode",
      app.get("port"),
      app.get("env")
    );
    console.log("  Press CTRL-C to stop\n");
  });
});
