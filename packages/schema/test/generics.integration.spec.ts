import {BodyParams, Controller, Post} from "@tsed/common";
import {expect} from "chai";
import {boolean, date, GenericOf, Generics, getJsonSchema, getSpec, number, Property, SpecTypes, string} from "../src";
import {validateSpec} from "./helpers/validateSpec";

@Generics("T")
class UserProperty<T> {
  @Property("T")
  value: T;
}

class Adjustment {
  @GenericOf(Number)
  adjustment: UserProperty<number>;
}

@Controller("/hello-world")
class HelloWorldController {
  @Post("/")
  get(@BodyParams() m: Adjustment) {
    return m;
  }
}

describe("Generics", () => {
  it("should generate the OS3", async () => {
    const spec = getSpec(HelloWorldController, {specType: SpecTypes.OPENAPI});

    expect(spec).to.deep.eq({
      "components": {
        "schemas": {
          "Adjustment": {
            "properties": {
              "adjustment": {
                "properties": {
                  "value": {
                    "type": "number"
                  }
                },
                "type": "object"
              }
            },
            "type": "object"
          }
        }
      },
      "paths": {
        "/hello-world": {
          "post": {
            "operationId": "helloWorldControllerGet",
            "parameters": [],
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Adjustment"
                  }
                }
              },
              "required": false
            },
            "responses": {
              "200": {
                "description": "Success"
              }
            },
            "tags": [
              "HelloWorldController"
            ]
          }
        }
      },
      "tags": [
        {
          "name": "HelloWorldController"
        }
      ]
    });
    expect(await validateSpec(spec, SpecTypes.OPENAPI)).to.eq(true);
  });
  it("should generate the OS2", async () => {
    const spec = getSpec(HelloWorldController, {specType: SpecTypes.SWAGGER});

    expect(await validateSpec(spec)).to.eq(true);
    expect(spec).to.deep.eq({
      "definitions": {
        "Adjustment": {
          "properties": {
            "adjustment": {
              "properties": {
                "value": {
                  "type": "number"
                }
              },
              "type": "object"
            }
          },
          "type": "object"
        }
      },
      "paths": {
        "/hello-world": {
          "post": {
            "operationId": "helloWorldControllerGet",
            "parameters": [
              {
                "in": "body",
                "name": "body",
                "required": false,
                "schema": {
                  "$ref": "#/definitions/Adjustment"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "Success"
              }
            },
            "tags": [
              "HelloWorldController"
            ]
          }
        }
      },
      "tags": [
        {
          "name": "HelloWorldController"
        }
      ]
    });
  });

  describe("using Functional api", () => {
    it("should generate JsonSchema with 'string' from generic object", () => {
      @Generics("T")
      class UserProperty<T> {
        @Property("T")
        value: T;
      }

      class Adjustment {
        @GenericOf(string())
        adjustment: UserProperty<string>;
      }

      let result = getJsonSchema(Adjustment);

      expect(result).to.deep.eq({
        "properties": {
          "adjustment": {
            "properties": {
              "value": {
                "type": "string"
              }
            },
            "type": "object"
          }
        },
        "type": "object"
      });
    });
    it("should generate JsonSchema with 'number' from generic object", () => {
      @Generics("T")
      class UserProperty<T> {
        @Property("T")
        value: T;
      }

      class Adjustment {
        @GenericOf(number())
        adjustment: UserProperty<number>;
      }

      let result = getJsonSchema(Adjustment);

      expect(result).to.deep.eq({
        "properties": {
          "adjustment": {
            "properties": {
              "value": {
                "type": "number"
              }
            },
            "type": "object"
          }
        },
        "type": "object"
      });
    });
    it("should generate JsonSchema with 'boolean' from generic object", () => {
      @Generics("T")
      class UserProperty<T> {
        @Property("T")
        value: T;
      }

      class Adjustment {
        @GenericOf(boolean())
        adjustment: UserProperty<Date>;
      }

      let result = getJsonSchema(Adjustment);

      expect(result).to.deep.eq({
        "properties": {
          "adjustment": {
            "properties": {
              "value": {
                "type": "boolean"
              }
            },
            "type": "object"
          }
        },
        "type": "object"
      });
    });
    it("should generate JsonSchema with 'date' from generic object", () => {
      @Generics("T")
      class UserProperty<T> {
        @Property("T")
        value: T;
      }

      class Adjustment {
        @GenericOf(date().format("date-time"))
        adjustment: UserProperty<Date>;
      }

      let result = getJsonSchema(Adjustment);

      expect(result).to.deep.eq({
        "properties": {
          "adjustment": {
            "properties": {
              "value": {
                "format": "date-time",
                "type": "string"
              }
            },
            "type": "object"
          }
        },
        "type": "object"
      });
    });
  });
  describe("using type", () => {
    it("should generate JsonSchema with 'string' from generic object", () => {
      @Generics("T")
      class UserProperty<T> {
        @Property("T")
        value: T;
      }

      class Adjustment {
        @GenericOf(String)
        adjustment: UserProperty<string>;
      }

      let result = getJsonSchema(Adjustment);;

      expect(result).to.deep.eq({
        "properties": {
          "adjustment": {
            "properties": {
              "value": {
                "type": "string"
              }
            },
            "type": "object"
          }
        },
        "type": "object"
      });
    });
    it("should generate JsonSchema with 'number' from generic object", () => {
      @Generics("T")
      class UserProperty<T> {
        @Property("T")
        value: T;
      }

      class Adjustment {
        @GenericOf(Number)
        adjustment: UserProperty<number>;
      }

      let result = getJsonSchema(Adjustment);

      expect(result).to.deep.eq({
        "properties": {
          "adjustment": {
            "properties": {
              "value": {
                "type": "number"
              }
            },
            "type": "object"
          }
        },
        "type": "object"
      });
    });
    it("should generate JsonSchema with 'boolean' from generic object", () => {
      @Generics("T")
      class UserProperty<T> {
        @Property("T")
        value: T;
      }

      class Adjustment {
        @GenericOf(Boolean)
        adjustment: UserProperty<Date>;
      }

      let result = getJsonSchema(Adjustment);

      expect(result).to.deep.eq({
        "properties": {
          "adjustment": {
            "properties": {
              "value": {
                "type": "boolean"
              }
            },
            "type": "object"
          }
        },
        "type": "object"
      });
    });
    it("should generate JsonSchema with 'date' from generic object", () => {
      @Generics("T")
      class UserProperty<T> {
        @Property("T")
        value: T;
      }

      class Adjustment {
        @GenericOf(Date)
        adjustment: UserProperty<Date>;
      }

      let result = getJsonSchema(Adjustment);

      expect(result).to.deep.eq({
        "properties": {
          "adjustment": {
            "properties": {
              "value": {
                "format": "date-time",
                "type": "string"
              }
            },
            "type": "object"
          }
        },
        "type": "object"
      });
    });
    it("should generate JsonSchema with 'enum' from generic object", () => {
      enum AdjustmentType {
        PRICE = "price",
        DELAY = "delay",
      }

      @Generics("T")
      class UserProperty<T> {
        @Property("T")
        value: T;
      }

      class Adjustment {
        @GenericOf(AdjustmentType)
        adjustment: UserProperty<AdjustmentType>;
      }

      let result = getJsonSchema(Adjustment);

      expect(result).to.deep.eq({
        "properties": {
          "adjustment": {
            "properties": {
              "value": {
                "enum": [
                  "price",
                  "delay"
                ],
                "type": "string"
              }
            },
            "type": "object"
          }
        },
        "type": "object"
      });
    });
  });
});