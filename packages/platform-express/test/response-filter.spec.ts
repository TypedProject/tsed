import {Context, Controller, Get, PlatformTest, Res, ResponseFilter} from "@tsed/common";
import {PlatformTestUtils} from "@tsed/platform-test-utils";
import {Returns} from "@tsed/schema";
import {expect} from "chai";
import * as Sinon from "sinon";
import SuperTest from "supertest";
import {PlatformExpress} from "../src";
import {rootDir, Server} from "./app/Server";

@ResponseFilter("plain/text")
class PlainTextFilter {
  transform(data: any, ctx: Context) {
    // `ctx.response.raw.headers` is always has `content-type` as `text/plain; charset=utf-8`
    return data;
  }
}

const utils = PlatformTestUtils.create({
  rootDir,
  platform: PlatformExpress,
  server: Server,
  logger: {
    level: "off"
  }
});

@Controller("/response-filter")
class TestPageableCtrl {
  @Get("/scenario-1")
  @Returns(200).ContentType("image/png")
  async scenario1() {
    const raw = "...";
    // response.setHeader('Content-Type', 'image/png');

    return Buffer.from(
      raw,
      "base64"
    );
  }

  @Get("/scenario-2")
  async scenario2(@Res() response: Res) {
    const raw = "...";
    response.setHeader("Content-Type", "image/png");

    return Buffer.from(
      raw,
      "base64"
    );
  }
}

const sandbox = Sinon.createSandbox();
describe("ResponseFilter", () => {
  let request: SuperTest.SuperTest<SuperTest.Test>;

  beforeEach(utils.bootstrap({
    mount: {
      "/rest": [TestPageableCtrl]
    },
    responseFilters: [PlainTextFilter]
  }));
  beforeEach(() => {
    sandbox.stub(PlainTextFilter.prototype, "transform");
    request = SuperTest(PlatformTest.callback());
  });

  afterEach(utils.reset);
  afterEach(() => sandbox.restore());

  it("should return png (scenario-1)", async () => {
    const {headers} = await request.get("/rest/response-filter/scenario-1").expect(200);

    expect(headers["content-type"]).to.equal("image/png");
    expect(PlainTextFilter.prototype.transform).to.not.have.been.called
  });

  it("should return png (scenario-2)", async () => {
    const {headers} = await request.get("/rest/response-filter/scenario-2").expect(200);

    expect(headers["content-type"]).to.equal("image/png");
    expect(PlainTextFilter.prototype.transform).to.not.have.been.called
  });
});
