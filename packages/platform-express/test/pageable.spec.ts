import {
  Controller,
  Get,
  PlatformContext,
  PlatformTest,
  QueryParams,
  ResponseFilter,
  ResponseFilterMethods
} from "@tsed/common";
import {isString} from "@tsed/core";
import {OnDeserialize} from "@tsed/json-mapper";
import {PlatformTestUtils} from "@tsed/platform-test-utils";
import {
  array,
  CollectionOf,
  Default,
  Description,
  For,
  Generics,
  getSpec,
  Integer,
  Min,
  MinLength,
  oneOf,
  Property,
  Returns,
  SpecTypes,
  string
} from "@tsed/schema";
import {expect} from "chai";
import qs from "querystring";
import SuperTest from "supertest";
import {PlatformExpress} from "../src";
import {rootDir, Server} from "./app/Server";

class Pageable {
  @Integer()
  @Min(0)
  @Default(0)
  @Description("Page number.")
  page: number = 0;

  @Integer()
  @Min(1)
  @Default(20)
  @Description("Number of objects per page.")
  size: number = 20;

  @For(SpecTypes.JSON, oneOf(string(), array().items(string()).maxItems(2)))
  @For(SpecTypes.OPENAPI, array().items(string()).maxItems(2))
  @For(SpecTypes.SWAGGER, array().items(string()).maxItems(2))
  @OnDeserialize((value: string | string[]) => (isString(value) ? value.split(",") : value))
  @Description("Sorting criteria: property(,asc|desc). Default sort order is ascending. Multiple sort criteria are supported.")
  sort: string | string[];

  constructor(options: Partial<Pageable>) {
    options.page && (this.page = options.page);
    options.size && (this.size = options.size);
    options.sort && (this.sort = options.sort);
  }

  get offset() {
    return this.page ? this.page * this.limit : 0;
  }

  get limit() {
    return this.size;
  }
}

@Generics("T")
class Pagination<T> extends Pageable {
  @CollectionOf("T")
  data: T[];

  @Integer()
  @MinLength(0)
  totalCount: number = 0;

  constructor({data, totalCount, pageable}: Partial<Pagination<T>> & {pageable: Pageable}) {
    super(pageable);
    data && (this.data = data);
    totalCount && (this.totalCount = totalCount);
  }

  get isPaginated() {
    return this.data.length < this.totalCount;
  }
}

class Product {
  @Property()
  id: string;

  @Property()
  title: string;

  constructor({id, title}: Partial<Product> = {}) {
    id && (this.id = id);
    title && (this.title = title);
  }
}

const utils = PlatformTestUtils.create({
  rootDir,
  platform: PlatformExpress,
  server: Server
});

@Controller("/pageable")
class TestPageableCtrl {
  @Get("/")
  @(Returns(206, Pagination).Of(Product).Title("PaginatedProduct"))
  @(Returns(200, Pagination).Of(Product).Title("PaginatedProduct"))
  async get(@QueryParams() pageableOptions: Pageable, @QueryParams("all") all: boolean) {
    return new Pagination<Product>({
      data: [
        new Product({
          id: "100",
          title: "CANON D3000"
        })
      ],
      totalCount: all ? 1 : 100, // just for test
      pageable: pageableOptions
    });
  }
}

@ResponseFilter("application/json")
class PaginationFilter implements ResponseFilterMethods {
  transform(data: unknown, ctx: PlatformContext): any {
    if (ctx.data instanceof Pagination) {
      // get the unserialized data
      if (ctx.data.isPaginated) {
        ctx.response.status(206);
      }
    }

    return data;
  }
}

describe("Pageable", () => {
  let request: SuperTest.SuperTest<SuperTest.Test>;

  before(
    utils.bootstrap({
      mount: {
        "/rest": [TestPageableCtrl]
      },
      responseFilters: [PaginationFilter],
      swagger: [
        {
          path: "/v2/docs",
          specVersion: "2.0" // by default
        },
        {
          path: "/v3/docs",
          specVersion: "3.0.1"
        }
      ]
    })
  );
  after(utils.reset);

  before(() => {
    request = SuperTest(PlatformTest.callback());
  });

  it("should generate spec", async () => {
    const spec = getSpec(TestPageableCtrl, {specType: SpecTypes.OPENAPI});
    expect(spec).to.deep.eq({
      paths: {
        "/pageable": {
          get: {
            operationId: "testPageableCtrlGet",
            parameters: [
              {
                in: "query",
                required: false,
                name: "page",
                description: "Page number.",
                schema: {type: "integer", default: 0, minimum: 0, multipleOf: 1}
              },
              {
                in: "query",
                required: false,
                name: "size",
                description: "Number of objects per page.",
                schema: {
                  type: "integer",
                  default: 20,
                  minimum: 1,
                  multipleOf: 1
                }
              },
              {
                in: "query",
                required: false,
                name: "sort",
                description:
                  "Sorting criteria: property(,asc|desc). Default sort order is ascending. Multiple sort criteria are supported.",
                schema: {
                  type: "array",
                  maxItems: 2,
                  items: {type: "string"}
                }
              },
              {in: "query", name: "all", required: false, schema: {type: "boolean"}}
            ],
            responses: {
              "200": {
                content: {"application/json": {schema: {$ref: "#/components/schemas/PaginatedProduct"}}},
                description: "Success"
              },
              "206": {
                content: {"application/json": {schema: {$ref: "#/components/schemas/PaginatedProduct"}}},
                description: "Partial Content"
              }
            },
            tags: ["TestPageableCtrl"]
          }
        }
      },
      tags: [{name: "TestPageableCtrl"}],
      components: {
        schemas: {
          Product: {
            type: "object",
            properties: {id: {type: "string"}, title: {type: "string"}}
          },
          PaginatedProduct: {
            type: "object",
            properties: {
              page: {
                type: "integer",
                description: "Page number.",
                default: 0,
                minimum: 0,
                multipleOf: 1
              },
              size: {
                type: "integer",
                description: "Number of objects per page.",
                default: 20,
                minimum: 1,
                multipleOf: 1
              },
              sort: {
                type: "array",
                description:
                  "Sorting criteria: property(,asc|desc). Default sort order is ascending. Multiple sort criteria are supported.",
                maxItems: 2,
                items: {type: "string"}
              },
              data: {type: "array", items: {$ref: "#/components/schemas/Product"}},
              totalCount: {type: "integer", minLength: 0, multipleOf: 1}
            }
          }
        }
      }
    });
  });

  it("should get paginated products with a status 206 (with array)", async () => {
    const options = {
      page: 1,
      size: 10,
      sort: ["field", "asc"]
    };

    const {body} = await request.get("/rest/pageable?" + qs.stringify(options)).expect(206);

    expect(body).to.deep.eq({
      data: [
        {
          id: "100",
          title: "CANON D3000"
        }
      ],
      page: 1,
      size: 10,
      sort: ["field", "asc"],
      totalCount: 100
    });
  });
  it("should get paginated products with a status 206 (with string)", async () => {
    const options = {
      page: 1,
      size: 10,
      sort: "field,asc"
    };

    const {body} = await request.get("/rest/pageable?" + qs.stringify(options)).expect(206);

    expect(body).to.deep.eq({
      data: [
        {
          id: "100",
          title: "CANON D3000"
        }
      ],
      page: 1,
      size: 10,
      sort: ["field", "asc"],
      totalCount: 100
    });
  });

  it("should get all products with a status 206", async () => {
    const options = {
      all: true
    };

    const {body} = await request.get("/rest/pageable?" + qs.stringify(options)).expect(200);

    expect(body).to.deep.eq({
      data: [{id: "100", title: "CANON D3000"}],
      totalCount: 1,
      page: 0,
      size: 20
    });
  });

  it("should not return a bad request when sort is not given", async () => {
    const options = {
      page: 1,
      size: 10
    };

    const {body} = await request.get("/rest/pageable?" + qs.stringify(options)).expect(206);

    expect(body).to.deep.eq({
      data: [
        {
          id: "100",
          title: "CANON D3000"
        }
      ],
      page: 1,
      size: 10,
      totalCount: 100
    });
  });

  it("should apply default pagination parameters", async () => {
    const options = {};

    const {body} = await request.get("/rest/pageable?" + qs.stringify(options)).expect(206);

    expect(body).to.deep.eq({
      data: [{id: "100", title: "CANON D3000"}],
      totalCount: 100,
      page: 0,
      size: 20
    });
  });

  it("should throw bad request when options isn't correct", async () => {
    const options = {
      page: -1
    };

    const {body} = await request.get("/rest/pageable?" + qs.stringify(options)).expect(400);

    expect(body).to.deep.eq({
      "errors": [
        {
          "dataPath": ".page",
          "instancePath": "/page",
          "keyword": "minimum",
          "message": "must be >= 0",
          "modelName": "Pageable",
          "params": {
            "comparison": ">=",
            "limit": 0
          },
          "schemaPath": "#/properties/page/minimum"
        }
      ],
      "message": "Bad request on parameter \"request.query\".\nPageable.page must be >= 0. Given value: \"undefined\"",
      "name": "AJV_VALIDATION_ERROR",
      "status": 400
    });
  });
});
