import "jest";
import chai from "chai";
import sinonChai from "sinon-chai";
import { setup } from "../src/app";

// This setup file will be run before jest runs other tests
// add chai plugins here
chai.use(sinonChai);

async function app() {
  return await setup();
}

// Be sure to await the app within async test functions
export default app();
