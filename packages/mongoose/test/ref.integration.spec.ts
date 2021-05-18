import {BodyParams, Controller, Get, Inject, PlatformTest, Post, QueryParams} from "@tsed/common";
import {deserialize} from "@tsed/json-mapper";
import {MongooseModel} from "@tsed/mongoose";
import {PlatformExpress} from "@tsed/platform-express";
import {TestMongooseContext} from "@tsed/testing-mongoose";
import {expect} from "chai";
import faker from "faker";
import SuperTest from "supertest";
import {TestProfile, TestUser} from "./helpers/models/User";
import {Server} from "./helpers/Server";

@Controller("/profiles")
class ProfilesCtrl {
  @Inject(TestUser)
  private UserModel: MongooseModel<TestUser>;

  @Inject(TestProfile)
  private ProfileModel: MongooseModel<TestProfile>;

  @Post("/user")
  createUser(@BodyParams() body: TestUser) {
    return new this.UserModel(body).save();
  }

  @Post("/")
  createProfile(@BodyParams() body: TestProfile) {
    return new this.ProfileModel(body).save();
  }

  @Get("/")
  async getTest(@QueryParams("full") full: boolean) {
    return full ? await this.ProfileModel.find().populate("user") : await this.ProfileModel.find();
  }
}

const baseUser = {
  email: faker.internet.email(),
  password: faker.internet.password(12)
};

const baseProfile = {
  image: faker.image.avatar(),
  age: faker.random.number(2)
};

describe("Mongoose", () => {
  describe("Ref", () => {
    let request: SuperTest.SuperTest<SuperTest.Test>;
    let currentUser: any;
    let currentProfile: any;
    before(
      TestMongooseContext.bootstrap(Server, {
        platform: PlatformExpress,
        mount: {
          "/rest": [ProfilesCtrl]
        }
      })
    );
    before(async () => {
      const repository = PlatformTest.get<ProfilesCtrl>(ProfilesCtrl)!;

      currentUser = await repository.createUser(deserialize<TestUser>(baseUser, {type: TestUser}));
      currentProfile = await repository.createProfile(deserialize<TestProfile>({
        ...baseProfile,
        user: currentUser._id
      }, {
        type: TestProfile
      }));
    });
    before(() => {
      request = SuperTest(PlatformTest.callback());
    });

    after(TestMongooseContext.reset);

    it("should transform mongoose instance to class", () => {
      const result = currentUser.toClass();

      expect(result).to.be.instanceof(TestUser);
      expect(result._id).to.be.a("string");
      expect(result.alwaysIgnored).to.equal("hello ignore");
      expect(result.created).to.be.a("date");
      expect(result.email).to.equal(currentUser.email);
      expect(result.password).to.equal(currentUser.password);
      expect(result.post).to.equal("hello post");
      expect(result.pre).to.equal("hello pre");
      expect(result.updated).to.be.a("date");
    });

    it("should transform mongoose instance to object", () => {
      const result = currentUser.toJSON({
        endpoint: true
      });

      expect(result).to.be.instanceof(Object);
      expect(result.id).to.be.a("string");
      expect(result.alwaysIgnored).to.eq(undefined);
      expect(result.created).to.be.a("string");
      expect(result.email).to.equal(currentUser.email);
      expect(result.password).to.equal(currentUser.password);
      expect(result.post).to.equal("hello post");
      expect(result.pre).to.equal("hello pre");
      expect(result.updated).to.be.a("string");
    });

    it("GET /profiles full=true", async () => {
      const {body: list} = await request.get(`/rest/profiles?full=true`);

      expect(list).to.deep.eq([
        {
          "id": list[0].id,
          "age": baseProfile.age,
          "image": baseProfile.image,
          "created": list[0].created,
          "updated": list[0].updated,
          "user": {
            "id": list[0].user.id,
            "email": baseUser.email,
            "password": baseUser.password,
            "pre": "hello pre",
            "created": list[0].user.created,
            "updated": list[0].user.updated
          }
        }
      ]);
    });

    it("GET /profiles full=false", async () => {
      const {body: list} = await request.get(`/rest/profiles?full=false`);

      expect(list).to.deep.eq([
        {
          "id": String(list[0].id),
          "created": String(list[0].created),
          "updated": String(list[0].updated),
          "age": baseProfile.age,
          "image": baseProfile.image,
          "user": String(list[0].user)
        }
      ]);
    });
  });
});
