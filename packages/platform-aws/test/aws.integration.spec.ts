import {PlatformTest} from "@tsed/common";
import "@tsed/platform-express";
import {PlatformExpress} from "@tsed/platform-express";
import {expect} from "chai";
import SuperTest from "supertest";
import {Server} from "./app/Server";

describe("Aws", () => {
  let request: SuperTest.SuperTest<SuperTest.Test>;

  before(
    PlatformTest.bootstrap(Server, {
      platform: PlatformExpress
    })
  );
  before(() => (request = SuperTest(PlatformTest.callback())));
  after(PlatformTest.reset);

  it("should return aws headers", async () => {
    const response = await request
      .get("/aws")
      .set({
        "x-apigateway-event": encodeURIComponent(JSON.stringify({event: "event"})),
        "x-apigateway-context": encodeURIComponent(JSON.stringify({context: "context"}))
      })
      .expect(200);

    expect(response.body).to.deep.eq({
      context: {
        context: "context"
      },
      event: {
        event: "event"
      }
    });
  });
});
