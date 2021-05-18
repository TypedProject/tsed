import {ancestorsOf, nameOf} from "@tsed/core";
import {Type} from "@tsed/core";
import {expect} from "chai";
import {Post} from "../../test/helpers/Post";
import {
  CollectionOf,
  Email,
  Format,
  GenericOf,
  Generics,
  getJsonSchema,
  JsonEntityStore,
  MinLength,
  Name,
  Property,
  Required
} from "../index";

describe("getJsonSchema", () => {
  it("should declare all schema correctly (basic)", () => {
    // WHEN
    class Model {
      @Property()
      @Required()
      prop1: string;

      @CollectionOf(String)
      prop2: string[];

      @CollectionOf(String)
      prop3: Set<string>;

      @CollectionOf(String)
      prop4: Map<string, string>;
    }

    // THEN
    expect(getJsonSchema(Model)).to.deep.equal({
      type: "object",
      required: ["prop1"],
      properties: {
        prop1: {
          minLength: 1,
          type: "string"
        },
        prop2: {
          type: "array",
          items: {
            type: "string"
          }
        },
        prop3: {
          type: "array",
          uniqueItems: true,
          items: {
            type: "string"
          }
        },
        prop4: {
          type: "object",
          additionalProperties: {
            type: "string"
          }
        }
      }
    });
  });
  it("should declare all schema correctly (alias)", () => {
    // WHEN
    class Model {
      @Name("prop_1")
      @Required()
      prop1: string;
    }

    // THEN
    const classSchema = JsonEntityStore.from(Model);

    expect(classSchema.schema.toJSON()).to.deep.equal({
      type: "object",
      required: ["prop_1"],
      properties: {
        prop_1: {
          minLength: 1,
          type: "string"
        }
      }
    });
  });
  it("should declare prop with a nested model", () => {
    // WHEN
    class NestedModel {
      @Property()
      id: string;

      @Property()
      prop1: string;
    }

    class Model {
      @Property()
      id: string;

      @Property()
      nested: NestedModel;
    }

    // THEN

    expect(getJsonSchema(NestedModel)).to.deep.equal({
      type: "object",
      properties: {
        id: {
          type: "string"
        },
        prop1: {
          type: "string"
        }
      }
    });

    expect(getJsonSchema(Model)).to.deep.equal({
      type: "object",
      properties: {
        id: {
          type: "string"
        },
        nested: {
          $ref: "#/definitions/NestedModel"
        }
      },
      definitions: {
        NestedModel: {
          type: "object",
          properties: {
            id: {
              type: "string"
            },
            prop1: {
              type: "string"
            }
          }
        }
      }
    });
  });
  it("should declare prop with a nested model with named model", () => {
    // WHEN
    @Name("Nested")
    class NestedModel {
      @Property()
      id: string;

      @Property()
      prop1: string;
    }

    class Model {
      @Property()
      id: string;

      @Property()
      nested: NestedModel;
    }

    // THEN

    expect(getJsonSchema(NestedModel)).to.deep.equal({
      type: "object",
      properties: {
        id: {
          type: "string"
        },
        prop1: {
          type: "string"
        }
      }
    });

    const options = {schemas: {}};
    expect(JsonEntityStore.from(Model).schema.clone().toJSON(options)).to.deep.eq({
      type: "object",
      properties: {
        id: {
          type: "string"
        },
        nested: {
          $ref: "#/definitions/Nested"
        }
      }
    });
    expect(options).to.deep.eq({
      schemas: {
        Nested: {
          properties: {
            id: {
              type: "string"
            },
            prop1: {
              type: "string"
            }
          },
          type: "object"
        }
      }
    });
    expect(getJsonSchema(Model)).to.deep.equal({
      type: "object",
      properties: {
        id: {
          type: "string"
        },
        nested: {
          $ref: "#/definitions/Nested"
        }
      },
      definitions: {
        Nested: {
          type: "object",
          properties: {
            id: {
              type: "string"
            },
            prop1: {
              type: "string"
            }
          }
        }
      }
    });
  });
  it("should declare prop with a nested of nested model (Array)", () => {
    // WHEN
    class ChildModel {
      @Property()
      id: string;

      @Property()
      prop1: string;
    }

    class NestedModel {
      @Property()
      id: string;

      @CollectionOf(ChildModel)
      children: ChildModel[];
    }

    class Model {
      @Property()
      id: string;

      @Property()
      nested: NestedModel;
    }

    // THEN
    expect(getJsonSchema(ChildModel)).to.deep.equal({
      type: "object",
      properties: {
        id: {
          type: "string"
        },
        prop1: {
          type: "string"
        }
      }
    });

    expect(getJsonSchema(NestedModel)).to.deep.equal({
      type: "object",
      properties: {
        id: {
          type: "string"
        },
        children: {
          type: "array",
          items: {
            $ref: "#/definitions/ChildModel"
          }
        }
      },
      definitions: {
        ChildModel: {
          type: "object",
          properties: {
            id: {
              type: "string"
            },
            prop1: {
              type: "string"
            }
          }
        }
      }
    });

    expect(getJsonSchema(Model)).to.deep.equal({
      type: "object",
      properties: {
        id: {
          type: "string"
        },
        nested: {
          $ref: "#/definitions/NestedModel"
        }
      },
      definitions: {
        NestedModel: {
          type: "object",
          properties: {
            id: {
              type: "string"
            },
            children: {
              type: "array",
              items: {
                $ref: "#/definitions/ChildModel"
              }
            }
          }
        },
        ChildModel: {
          type: "object",
          properties: {
            id: {
              type: "string"
            },
            prop1: {
              type: "string"
            }
          }
        }
      }
    });
  });
  it("should declare prop with a nested of nested model (Set)", () => {
    // WHEN
    class ChildModel {
      @Property()
      id: string;

      @Property()
      prop1: string;
    }

    class NestedModel {
      @Property()
      id: string;

      @CollectionOf(ChildModel)
      children: Set<ChildModel>;
    }

    class Model {
      @Property()
      id: string;

      @Property()
      nested: NestedModel;
    }

    // THEN
    expect(getJsonSchema(ChildModel)).to.deep.equal({
      type: "object",
      properties: {
        id: {
          type: "string"
        },
        prop1: {
          type: "string"
        }
      }
    });

    expect(getJsonSchema(NestedModel)).to.deep.equal({
      type: "object",
      properties: {
        id: {
          type: "string"
        },
        children: {
          type: "array",
          uniqueItems: true,
          items: {
            $ref: "#/definitions/ChildModel"
          }
        }
      },
      definitions: {
        ChildModel: {
          type: "object",
          properties: {
            id: {
              type: "string"
            },
            prop1: {
              type: "string"
            }
          }
        }
      }
    });

    expect(getJsonSchema(Model)).to.deep.equal({
      type: "object",
      properties: {
        id: {
          type: "string"
        },
        nested: {
          $ref: "#/definitions/NestedModel"
        }
      },
      definitions: {
        NestedModel: {
          type: "object",
          properties: {
            id: {
              type: "string"
            },
            children: {
              type: "array",
              uniqueItems: true,
              items: {
                $ref: "#/definitions/ChildModel"
              }
            }
          }
        },
        ChildModel: {
          type: "object",
          properties: {
            id: {
              type: "string"
            },
            prop1: {
              type: "string"
            }
          }
        }
      }
    });
  });
  it("should declare prop with a nested of nested model (Map)", () => {
    // WHEN
    class ChildModel {
      @Property()
      id: string;

      @Property()
      prop1: string;
    }

    class NestedModel {
      @Property()
      id: string;

      @CollectionOf(ChildModel)
      children: Map<string, ChildModel>;
    }

    class Model {
      @Property()
      id: string;

      @Property()
      nested: NestedModel;
    }

    // THEN
    expect(getJsonSchema(ChildModel)).to.deep.equal({
      type: "object",
      properties: {
        id: {
          type: "string"
        },
        prop1: {
          type: "string"
        }
      }
    });

    expect(getJsonSchema(NestedModel)).to.deep.equal({
      type: "object",
      properties: {
        id: {
          type: "string"
        },
        children: {
          type: "object",
          additionalProperties: {
            $ref: "#/definitions/ChildModel"
          }
        }
      },
      definitions: {
        ChildModel: {
          type: "object",
          properties: {
            id: {
              type: "string"
            },
            prop1: {
              type: "string"
            }
          }
        }
      }
    });

    expect(getJsonSchema(Model)).to.deep.equal({
      type: "object",
      properties: {
        id: {
          type: "string"
        },
        nested: {
          $ref: "#/definitions/NestedModel"
        }
      },
      definitions: {
        NestedModel: {
          type: "object",
          properties: {
            id: {
              type: "string"
            },
            children: {
              type: "object",
              additionalProperties: {
                $ref: "#/definitions/ChildModel"
              }
            }
          }
        },
        ChildModel: {
          type: "object",
          properties: {
            id: {
              type: "string"
            },
            prop1: {
              type: "string"
            }
          }
        }
      }
    });
  });
  it("should accept circular ref", () => {
    // WHEN

    // THEN
    const classSchema = getJsonSchema(Post);

    expect(classSchema).to.deep.equal({
      definitions: {
        Post: {
          properties: {
            id: {
              type: "string"
            },
            owner: {
              $ref: "#/definitions/User"
            }
          },
          type: "object"
        },
        User: {
          properties: {
            name: {
              type: "string"
            },
            posts: {
              items: {
                $ref: "#/definitions/Post"
              },
              type: "array"
            }
          },
          type: "object"
        }
      },
      properties: {
        id: {
          type: "string"
        },
        owner: {
          $ref: "#/definitions/User"
        }
      },
      type: "object"
    });
  });
  it("should return the json schema for an inherited model", () => {
    class Base {
      @Property()
      id: string;

      @Required()
      @Email()
      email: string;
    }

    class Model extends Base {
      @MinLength(0)
      email: string;

      @Property()
      name: string;
    }

    expect(getJsonSchema(Model)).to.deep.eq({
      type: "object",
      properties: {
        id: {
          type: "string"
        },
        email: {
          type: "string",
          minLength: 0,
          format: "email"
        },
        name: {
          type: "string"
        }
      },
      required: ["email"]
    });
  });
  it("should return the json schema for an inherited model and generics", () => {
    @Generics("T")
    class Base<T> {
      @Property()
      id: string;

      @Required()
      @Email()
      email: string;

      @Property("T")
      role: T;
    }

    class Model<T> extends Base<T> {
      @MinLength(0)
      email: string;

      @Property()
      name: string;
    }

    class Role {
      @Property()
      level: string;
    }

    class Content {
      @GenericOf(Role)
      payload: Model<Role>;
    }

    expect(getJsonSchema(Content)).to.deep.eq({
      definitions: {
        Role: {
          properties: {
            level: {
              type: "string"
            }
          },
          type: "object"
        }
      },
      properties: {
        payload: {
          properties: {
            email: {
              format: "email",
              minLength: 0,
              type: "string"
            },
            id: {
              type: "string"
            },
            name: {
              type: "string"
            },
            role: {
              $ref: "#/definitions/Role"
            }
          },
          required: ["email"],
          type: "object"
        }
      },
      type: "object"
    });
  });
  it("should return the json schema with hosted schemes", () => {
    @Generics("T")
    class Base<T> {
      @Property()
      id: string;

      @Required()
      @Email()
      email: string;

      @Property("T")
      role: T;
    }

    class Model<T> extends Base<T> {
      @MinLength(0)
      email: string;

      @Property()
      name: string;
    }

    class Role {
      @Property()
      level: string;
    }

    class Content {
      @GenericOf(Role)
      payload: Model<Role>;
    }

    expect(getJsonSchema(Content, {host: "http://example.com/schema"})).to.deep.eq({
      definitions: {
        Role: {
          properties: {
            level: {
              type: "string"
            }
          },
          type: "object"
        }
      },
      properties: {
        payload: {
          properties: {
            email: {
              format: "email",
              minLength: 0,
              type: "string"
            },
            id: {
              type: "string"
            },
            name: {
              type: "string"
            },
            role: {
              $ref: "http://example.com/schema/Role"
            }
          },
          required: ["email"],
          type: "object"
        }
      },
      type: "object"
    });
  });
  it("should keep required meta from inherited class", () => {
    // WHEN
    const AutoUUID = <T extends Type<any>>(Base: T) => {
      class AutoUUIDMixin extends Base {
        @Property() //showing up in swagger as a property
        @Format("uuid") //showing up as a uuid in swagger
        @Required(true)
        id: string;
      }

      return AutoUUIDMixin;
    };

    const WithDates = <T extends Type<any>>(Base: T) => {
      class WithDates extends Base {
        @Property() //showing up in swagger as a property
        @Format("datetime") //showing up as a uuid in swagger
        @Required(true)
        created_at: string;

        @Property() //showing up in swagger as a property
        @Format("datetime") //showing up as a uuid in swagger
        @Required(true)
        updated_at: string;
      }

      return WithDates;
    };

    class Model {
      @Required()
      name: string;
    }

    const DefaultMixins = <T extends Type<any>>(Base: T) => AutoUUID(WithDates(Base));

    class EmailTemplate extends DefaultMixins(Model) {
      @Required()
      engine: string;
    }

    // THEN
    expect(ancestorsOf(EmailTemplate).map(nameOf)).to.deep.equal(["Model", "WithDates", "AutoUUIDMixin", "EmailTemplate"]);
    expect(getJsonSchema(EmailTemplate)).to.deep.equal({
      properties: {
        created_at: {
          format: "datetime",
          minLength: 1,
          type: "string"
        },
        engine: {
          minLength: 1,
          type: "string"
        },
        id: {
          format: "uuid",
          minLength: 1,
          type: "string"
        },
        name: {
          minLength: 1,
          type: "string"
        },
        updated_at: {
          format: "datetime",
          minLength: 1,
          type: "string"
        }
      },
      required: ["name", "created_at", "updated_at", "id", "engine"],
      type: "object"
    });
  });
});
