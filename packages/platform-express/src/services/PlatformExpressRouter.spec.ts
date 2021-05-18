import {PlatformHandler, PlatformRouter} from "@tsed/common";
import {InjectorService} from "@tsed/di";
import {expect} from "chai";
import Express from "express";
import Sinon from "sinon";
import {stub} from "../../../../test/helper/tools";
import {PlatformExpressRouter} from "./PlatformExpressRouter";

const sandbox = Sinon.createSandbox();
describe("PlatformExpressRouter", () => {
  beforeEach(() => {
    sandbox.stub(Express, "Router");
  });
  afterEach(() => {
    sandbox.restore();
  });
  describe("create()", () => {
    it("should create a new router", async () => {
      // GIVEN
      const nativeDriver = {
        use: sandbox.stub(),
        all: sandbox.stub(),
        get: sandbox.stub(),
        post: sandbox.stub(),
        put: sandbox.stub(),
        delete: sandbox.stub(),
        patch: sandbox.stub(),
        head: sandbox.stub(),
        options: sandbox.stub()
      };

      stub(Express.Router).returns(nativeDriver);

      const platformHandler = {
        createHandler: sandbox.stub().callsFake((o) => o)
      };

      const injector = new InjectorService();
      injector.addProvider(PlatformHandler, {
        useValue: platformHandler
      });
      injector.addProvider(PlatformRouter, {
        useClass: PlatformExpressRouter
      });
      injector.settings.express = {
        router: {
          mergeParams: true
        }
      };

      const routerOptions: any = {
        test: "options"
      };

      // WHEN
      const router = PlatformRouter.create(injector, routerOptions);

      // THEN
      expect(Express.Router).to.have.been.calledWithExactly({...injector.settings.express.router, ...routerOptions});

      expect(router.raw).to.deep.eq(nativeDriver);
    });
  });
});
