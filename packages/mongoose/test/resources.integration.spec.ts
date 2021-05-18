import {BodyParams, Controller, Get, Inject, Injectable, PathParams, PlatformTest, Post} from "@tsed/common";
import {deserialize} from "@tsed/json-mapper";
import {MongooseModel} from "@tsed/mongoose";
import {PlatformExpress} from "@tsed/platform-express";
import {Groups, Returns} from "@tsed/schema";
import {TestMongooseContext} from "@tsed/testing-mongoose";
import {expect} from "chai";
import faker from "faker";
import SuperTest from "supertest";
import {isArray} from "@tsed/core";
import {TestRole, TestUser, TestUserNew} from "./helpers/models/User";
import {Server} from "./helpers/Server";

@Injectable()
class ResourcesRepository {
  @Inject(TestUser)
  model: MongooseModel<TestUser>;

  create(user: Partial<TestUser>) {
    const resource = new this.model(user);

    return resource.save();
  }

  findById(id: string) {
    return this.model.findById(id);
  }

  findAll() {
    return this.model.find({});
  }
}

@Controller("/resources")
class ResourcesCtrl {
  @Inject()
  repository: ResourcesRepository;

  @Inject(TestUserNew)
  TestUserNew: MongooseModel<TestUserNew>;

  @Inject(TestRole)
  TestRole: MongooseModel<TestRole>;

  @Get("/without/:id")
  @Returns(200, TestUser).Groups("!creation")
  getWithoutType(@PathParams("id") id: string) {
    return this.repository.findById(id);
  }

  @Get("/:id")
  @Returns(200, TestUser).Groups("!creation")
  get(@PathParams("id") id: string) {
    return this.repository.findById(id);
  }

  @Get("/")
  @(Returns(200, Array).Of(TestUser)).Groups("!creation")
  getAll() {
    return this.repository.findAll();
  }

  @Post("/")
  @Returns(201, TestUser).Groups("!creation")
  async create(@BodyParams() @Groups("creation") user: TestUser) {
    return this.repository.create(user);
  }

  @Post("/scenario-1")
  async createWithoutReturnedType() {
    const role = new this.TestRole(new TestRole());
    const user = new this.TestUserNew(new TestUserNew());

    role.name = faker.hacker.verb();

    await role.save();

    user.name = faker.name.firstName();

    user.roles = [role._id];

    await user.save();

    return {
      id: user._id,
      roles: user.roles
    }; // Isn't necessary to map the model.
  }
}

const baseUser = {
  email: faker.internet.email(),
  password: faker.internet.password(12)
};

const baseUser2 = {
  email: faker.internet.email(),
  password: faker.internet.password(12)
};

describe("Mongoose", () => {
  describe("Test Resource", () => {
    let request: SuperTest.SuperTest<SuperTest.Test>;
    let currentUser: TestUser;
    let currentUser2: TestUser;
    before(
      TestMongooseContext.bootstrap(Server, {
        platform: PlatformExpress,
        mount: {
          "/rest": [ResourcesCtrl]
        }
      })
    );
    before(async () => {
      const repository = PlatformTest.get<ResourcesRepository>(ResourcesRepository)!;

      currentUser2 = await repository.create(baseUser2);

      const dataScope = new Map();
      dataScope.set("scope1", currentUser2._id);

      currentUser = await repository.create({
        ...baseUser,
        dataScope
      });
    });
    before(() => {
      request = SuperTest(PlatformTest.callback());
    });

    after(TestMongooseContext.reset);

    it("should get a user", async () => {
      const {body} = await request.get(`/rest/resources/${currentUser._id}`);

      expect(body).to.deep.eq({
        email: baseUser.email,
        id: currentUser._id.toString(),
        pre: "hello pre",
        created: String(body.created),
        updated: String(body.updated)
      });
    });

    it("should get a user without typing", async () => {
      const {body} = await request.get(`/rest/resources/without/${currentUser._id}`);

      expect(body).to.deep.eq({
        email: baseUser.email,
        id: currentUser._id.toString(),
        pre: "hello pre",
        created: String(body.created),
        updated: String(body.updated)
      });
    });

    it("should get users", async () => {
      const {body} = await request.get(`/rest/resources`);

      expect(body).to.deep.eq([
        {
          email: baseUser2.email,
          id: currentUser2._id.toString(),
          pre: "hello pre",
          created: String(body[0].created),
          updated: String(body[0].updated)
        },
        {
          email: baseUser.email,
          id: currentUser._id.toString(),
          pre: "hello pre",
          created: String(body[1].created),
          updated: String(body[1].updated)
        }
      ]);
    });

    it("should create a user", async () => {
      const user = {
        email: faker.internet.email(),
        password: faker.internet.password(),
        current: {
          roles: [
            1,
            2,
            3
          ]
        },
        data: {
          "ISM": {
            roles: [
              1,
              2,
              3
            ]
          }
        }
      };

      expect(deserialize(user, {
        type: TestUser
      })).to.deep.eq({
        email: user.email,
        password: user.password,
        current: {
          roles: [
            1,
            2,
            3
          ]
        },
        data: new Map([
          ["ISM", {
            roles: [
              1,
              2,
              3
            ]
          }]
        ]),
        alwaysIgnored: "hello ignore"
      });

      const {body} = await request.post(`/rest/resources`).send(user).expect(201);

      expect(body).to.deep.eq({
        "current": {
          "roles": [
            1,
            2,
            3
          ]
        },
        "data": {
          "ISM": {
            "roles": [
              1,
              2,
              3
            ]
          }
        },
        "email": user.email,
        "id": body.id,
        "password": user.password,
        "post": "hello post",
        "pre": "hello pre",
        created: String(body.created),
        updated: String(body.updated)
      });
    });

    it('should return an array of roles', async () => {
      const {body} = await request.post('/rest/resources/scenario-1')
      expect(isArray(body.roles)).to.equal(true)
    })
  });
});
