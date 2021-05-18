import {GlobalProviders, InjectorService} from "@tsed/di";
import {expect} from "chai";
import Sinon from "sinon";
import {Controller} from "../../mvc";
import {PlatformTest} from "../../platform-test/components/PlatformTest";
import {Platform} from "./Platform";
import {PlatformApplication} from "./PlatformApplication";
import {PlatformRouter} from "./PlatformRouter";

const sandbox = Sinon.createSandbox();

describe("Platform", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);
  afterEach(() => sandbox.restore());
  describe("createRouter", () => {
    it(
      "should create a router",
      PlatformTest.inject([InjectorService, Platform], async (injector: InjectorService, platform: Platform) => {
        const givenRouter = {
          use: sandbox.stub()
        };

        injector.addProvider(PlatformRouter, {
          useFactory() {
            return givenRouter;
          }
        });

        sandbox.spy(injector, "invoke");
        // WHEN
        const router = platform.createRouter({options: "options"});

        // THEN
        expect(injector.invoke).to.have.been.calledWithExactly(PlatformRouter, Sinon.match.any);
        expect(router).to.deep.eq(givenRouter);
      })
    );
  });
  describe("addRoute", () => {
    @Controller("/my-route")
    class MyCtrl {}

    after(() => {
      GlobalProviders.delete(MyCtrl);
    });

    it(
      "should add a route",
      PlatformTest.inject([InjectorService], async (injector: InjectorService) => {
        // GIVEN
        const driver = {
          use: sandbox.stub(),
          raw: {
            use: sandbox.stub()
          }
        };

        const platform = await PlatformTest.invoke<Platform>(Platform, [
          {
            token: PlatformApplication,
            use: driver
          }
        ]);

        // WHEN
        platform.addRoute("/test", MyCtrl);

        // THEN
        const provider = injector.getProvider(MyCtrl)!;
        expect(platform.routes).to.deep.eq([{provider, route: "/test/my-route"}]);
        expect(driver.use).to.have.been.calledWithExactly("/test/my-route", provider.getRouter().raw);
      })
    );
  });
  describe("getRoutes", () => {
    const sandbox = Sinon.createSandbox();

    @Controller("/my-route")
    class MyCtrl {}

    after(() => {
      GlobalProviders.delete(MyCtrl);
    });

    it("should add a route", async () => {
      // GIVEN
      const driver = {
        use: sandbox.stub(),
        raw: {
          use: sandbox.stub()
        }
      };

      const platform = await PlatformTest.invoke<Platform>(Platform, [
        {
          token: PlatformApplication,
          use: driver
        }
      ]);

      // WHEN
      platform.addRoute("/test", MyCtrl);

      const result = platform.getRoutes();

      // THEN
      expect(result).to.deep.eq([]);
    });
  });
});
