import {PlatformTest} from "@tsed/common";
import {expect} from "chai";
import Sinon from "sinon";
import {FakeResponse} from "../../../../test/helper";
import {OidcNoCacheMiddleware} from "./OidcNoCacheMiddleware";

const sandbox = Sinon.createSandbox();

describe("OidcNoCacheMiddleware", () => {
  beforeEach(() => PlatformTest.create());
  afterEach(() => PlatformTest.reset());
  it("should add headers", () => {
    const middleware = PlatformTest.get<OidcNoCacheMiddleware>(OidcNoCacheMiddleware);
    const response = new FakeResponse(sandbox);
    const ctx = PlatformTest.createRequestContext({
      response: response as any
    });

    middleware.use(ctx);

    expect(response.setHeader).to.have.been.calledWithExactly("Pragma", "no-cache");
    expect(response.setHeader).to.have.been.calledWithExactly("Cache-Control", "no-cache, no-store");
  });
});
