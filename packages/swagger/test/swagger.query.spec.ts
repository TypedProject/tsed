import {Controller, Get, MinLength, PlatformTest, Property, QueryParams, Required} from "@tsed/common";
import {PlatformExpress} from "@tsed/platform-express";
import {expect} from "chai";
import SuperTest from "supertest";
import {Server} from "./app/Server";

class QueryParamModel {
  @Required()
  @MinLength(1)
  name: string;

  @Property()
  duration: number;
}

@Controller("/scenarios")
class QueryParamsSwaggerController {
  @Get("/1")
  scenario1(@QueryParams("id") id: string) {}

  @Get("/2")
  scenario2(@QueryParams("ids", String) ids: string[]) {}

  @Get("/3")
  scenario3(@QueryParams("ids", String) ids: Map<string, string>) {}

  @Get("/4")
  scenario4(@QueryParams() params: QueryParamModel, @QueryParams("locale") locale: string) {}
}

describe("Swagger query params", () => {
  let request: SuperTest.SuperTest<SuperTest.Test>;
  beforeEach(
    PlatformTest.bootstrap(Server, {
      platform: PlatformExpress,
      mount: {
        "/rest": [QueryParamsSwaggerController]
      }
    })
  );
  beforeEach(() => {
    request = SuperTest(PlatformTest.callback());
  });
  afterEach(PlatformTest.reset);

  it("should generate swagger", async () => {
    const response = await request.get("/v2/doc/swagger.json").expect(200);
    expect(response.body).to.deep.eq({
      consumes: ["application/json"],
      info: {
        title: "Swagger title",
        version: "1.2.0"
      },
      paths: {
        "/rest/scenarios/1": {
          get: {
            operationId: "queryParamsSwaggerControllerScenario1",
            parameters: [
              {
                in: "query",
                name: "id",
                required: false,
                type: "string"
              }
            ],
            responses: {
              "200": {
                description: "Success"
              }
            },
            tags: ["QueryParamsSwaggerController"]
          }
        },
        "/rest/scenarios/2": {
          get: {
            operationId: "queryParamsSwaggerControllerScenario2",
            parameters: [
              {
                collectionFormat: "multi",
                in: "query",
                items: {
                  type: "string"
                },
                name: "ids",
                required: false,
                type: "array"
              }
            ],
            responses: {
              "200": {
                description: "Success"
              }
            },
            tags: ["QueryParamsSwaggerController"]
          }
        },
        "/rest/scenarios/3": {
          get: {
            operationId: "queryParamsSwaggerControllerScenario3",
            parameters: [
              {
                additionalProperties: {
                  type: "string"
                },
                in: "query",
                name: "ids",
                required: false,
                type: "object"
              }
            ],
            responses: {
              "200": {
                description: "Success"
              }
            },
            tags: ["QueryParamsSwaggerController"]
          }
        },
        "/rest/scenarios/4": {
          get: {
            operationId: "queryParamsSwaggerControllerScenario4",
            parameters: [
              {
                in: "query",
                minLength: 1,
                name: "name",
                required: true,
                type: "string"
              },
              {
                in: "query",
                name: "duration",
                required: false,
                type: "number"
              },
              {
                in: "query",
                name: "locale",
                required: false,
                type: "string"
              }
            ],
            responses: {
              "200": {
                description: "Success"
              }
            },
            tags: ["QueryParamsSwaggerController"]
          }
        }
      },
      produces: ["application/json"],
      swagger: "2.0",
      tags: [
        {
          name: "QueryParamsSwaggerController"
        }
      ]
    });

    await request.get("/rest/scenarios/4?name=name&duration=1&locale=fr-FR");
  });
});
