import {Controller, Get, PlatformContext, PlatformTest} from "@tsed/common";
import {ResponseFilter} from "@tsed/common";
import {ResponseFilterMethods} from "@tsed/common";
import {Property, Returns} from "@tsed/schema";
import {expect} from "chai";
import SuperTest from "supertest";
import {PlatformTestOptions} from "../interfaces";

class ResponseFilterModel {
  @Property()
  id: string;
}

@Controller("/response-filter")
class TestResponseFilterCtrl {
  @Get("/scenario1/:id")
  @(Returns(200, ResponseFilterModel).Description("description"))
  @(Returns(200, String).ContentType("text/xml"))
  public testScenario1() {
    return {id: "id"};
  }
}

@ResponseFilter("text/xml")
class XmlResponseFilter implements ResponseFilterMethods {
  transform(data: unknown, ctx: PlatformContext) {
    return "<xml>test</xml>";
  }
}

@ResponseFilter("*/*")
class AnyResponseFilter implements ResponseFilterMethods {
  transform(data: unknown, ctx: PlatformContext) {
    return {data, errors: []};
  }
}

export function testResponseFilter(options: PlatformTestOptions) {
  let request: SuperTest.SuperTest<SuperTest.Test>;

  before(
    PlatformTest.bootstrap(options.server, {
      ...options,
      mount: {
        "/rest": [TestResponseFilterCtrl]
      },
      responseFilters: [XmlResponseFilter, AnyResponseFilter]
    })
  );
  before(() => {
    request = SuperTest(PlatformTest.callback());
  });
  after(PlatformTest.reset);

  describe("Scenario1: when have multiple contentType", () => {
    describe("GET /rest/response/scenario1/:id", () => {
      it("should return the xml format", async () => {
        const response = await request
          .get("/rest/response-filter/scenario1/10")
          .set({
            Accept: "text/xml"
          })
          .expect(200);

        expect(response.text).to.equal("<xml>test</xml>");
      });
      it("should return the xml format when Accept text/xml and application/json", async () => {
        const response = await request
          .get("/rest/response-filter/scenario1/10")
          .set({
            Accept: "text/xml, application/json"
          })
          .expect(200);

        expect(response.text).to.equal("<xml>test</xml>");
      });
      it("should return the json format", async () => {
        const response = await request
          .get("/rest/response-filter/scenario1/10")
          .set({
            Accept: "application/json"
          })
          .expect(200);

        expect(response.body).to.deep.equal({
          data: {
            id: "id"
          },
          errors: []
        });
      });
      it("should return the json format by default", async () => {
        const response = await request.get("/rest/response-filter/scenario1/10").expect(200);

        expect(response.body).to.deep.equal({
          data: {
            id: "id"
          },
          errors: []
        });
      });
    });
  });
}
