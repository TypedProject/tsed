import {Injectable, PlatformTest} from "@tsed/common";
import {Inject} from "@tsed/di";
import {getJsonSchema} from "@tsed/schema";
import {TestMongooseContext} from "@tsed/testing-mongoose";
import {expect} from "chai";
import {MongooseModel} from "../src";
import {TestContract} from "./helpers/models/Contract";
import {TestCustomer} from "./helpers/models/Customer";
import {SelfUser} from "./helpers/models/User";

@Injectable()
class MyService {
  @Inject(TestContract)
  contract: MongooseModel<TestContract>;

  @Inject(TestCustomer)
  customer: MongooseModel<TestCustomer>;

  @Inject(SelfUser)
  user: MongooseModel<SelfUser>;
}

describe("Circular Ref", () => {
  beforeEach(TestMongooseContext.create);
  afterEach(TestMongooseContext.reset);
  it("should load models with his schema", async () => {
    const service = await PlatformTest.invoke<MyService>(MyService);

    expect(!!service.contract).to.be.true;
    expect(!!service.customer).to.be.true;


    expect(getJsonSchema(TestContract)).to.deep.equal({
      "definitions": {
        "SelfUser": {
          "properties": {
            "_id": {
              "description": "Mongoose ObjectId",
              "examples": [
                "5ce7ad3028890bd71749d477"
              ],
              "pattern": "^[0-9a-fA-F]{24}$",
              "type": "string"
            },
            "createdBy": {
              "oneOf": [
                {
                  "description": "Mongoose Ref ObjectId",
                  "examples": [
                    "5ce7ad3028890bd71749d477"
                  ],
                  "type": "string"
                },
                {
                  "$ref": "#/definitions/SelfUser"
                }
              ]
            }
          },
          "type": "object"
        },
        "TestClient": {
          "properties": {
            "_id": {
              "description": "Mongoose ObjectId",
              "examples": [
                "5ce7ad3028890bd71749d477"
              ],
              "pattern": "^[0-9a-fA-F]{24}$",
              "type": "string"
            },
            "users": {
              "oneOf": [
                {
                  "description": "Mongoose Ref ObjectId",
                  "examples": [
                    "5ce7ad3028890bd71749d477"
                  ],
                  "type": "string"
                },
                {
                  "$ref": "#/definitions/SelfUser"
                }
              ]
            }
          },
          "type": "object"
        },
        "TestContract": {
          "properties": {
            "_id": {
              "description": "Mongoose ObjectId",
              "examples": [
                "5ce7ad3028890bd71749d477"
              ],
              "pattern": "^[0-9a-fA-F]{24}$",
              "type": "string"
            },
            "customer": {
              "oneOf": [
                {
                  "description": "Mongoose Ref ObjectId",
                  "examples": [
                    "5ce7ad3028890bd71749d477"
                  ],
                  "type": "string"
                },
                {
                  "$ref": "#/definitions/TestCustomer"
                }
              ]
            }
          },
          "type": "object"
        },
        "TestCustomer": {
          "properties": {
            "_id": {
              "description": "Mongoose ObjectId",
              "examples": [
                "5ce7ad3028890bd71749d477"
              ],
              "pattern": "^[0-9a-fA-F]{24}$",
              "type": "string"
            },
            "client": {
              "oneOf": [
                {
                  "description": "Mongoose Ref ObjectId",
                  "examples": [
                    "5ce7ad3028890bd71749d477"
                  ],
                  "type": "string"
                },
                {
                  "$ref": "#/definitions/TestClient"
                }
              ]
            },
            "contracts": {
              "items": {
                "oneOf": [
                  {
                    "description": "Mongoose Ref ObjectId",
                    "examples": [
                      "5ce7ad3028890bd71749d477"
                    ],
                    "type": "string"
                  },
                  {
                    "$ref": "#/definitions/TestContract"
                  }
                ]
              },
              "type": "array"
            }
          },
          "type": "object"
        }
      },
      "properties": {
        "_id": {
          "description": "Mongoose ObjectId",
          "examples": [
            "5ce7ad3028890bd71749d477"
          ],
          "pattern": "^[0-9a-fA-F]{24}$",
          "type": "string"
        },
        "customer": {
          "oneOf": [
            {
              "description": "Mongoose Ref ObjectId",
              "examples": [
                "5ce7ad3028890bd71749d477"
              ],
              "type": "string"
            },
            {
              "$ref": "#/definitions/TestCustomer"
            }
          ]
        }
      },
      "type": "object"
    });
  });
  it('should resolve correctly a self reference', async() => {
    const service = await PlatformTest.invoke<MyService>(MyService);

    expect(!!service.user).to.be.true;

    expect(getJsonSchema(SelfUser)).to.deep.equal({
      "definitions": {
        "SelfUser": {
          "properties": {
            "_id": {
              "description": "Mongoose ObjectId",
              "examples": [
                "5ce7ad3028890bd71749d477"
              ],
              "pattern": "^[0-9a-fA-F]{24}$",
              "type": "string"
            },
            "createdBy": {
              "oneOf": [
                {
                  "description": "Mongoose Ref ObjectId",
                  "examples": [
                    "5ce7ad3028890bd71749d477"
                  ],
                  "type": "string"
                },
                {
                  "$ref": "#/definitions/SelfUser"
                }
              ]
            }
          },
          "type": "object"
        }
      },
      "properties": {
        "_id": {
          "description": "Mongoose ObjectId",
          "examples": [
            "5ce7ad3028890bd71749d477"
          ],
          "pattern": "^[0-9a-fA-F]{24}$",
          "type": "string"
        },
        "createdBy": {
          "oneOf": [
            {
              "description": "Mongoose Ref ObjectId",
              "examples": [
                "5ce7ad3028890bd71749d477"
              ],
              "type": "string"
            },
            {
              "$ref": "#/definitions/SelfUser"
            }
          ]
        }
      },
      "type": "object"
    });
  })
});