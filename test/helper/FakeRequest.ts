import {PlatformContext} from "@tsed/common";
import * as Sinon from "sinon";
import {SinonStub} from "sinon";

const accepts = require("accepts");

export class FakeRequest {
  public url = "/";
  public originalUrl = "/";
  public method: string;
  public path: string;
  public id: number;
  public secure: boolean;
  /**
   *
   * @type {{test: string, obj: {test: string}}}
   */
  public cookies: any = {
    test: "testValue",
    obj: {
      test: "testValue"
    }
  };
  /**
   *
   * @type {{test: string, obj: {test: string}}}
   */
  public body: any = {
    test: "testValue",
    obj: {
      test: "testValue"
    }
  };
  /**
   *
   * @type {{test: string, obj: {test: string}}}
   */
  public query: any = {
    test: "testValue",
    obj: {
      test: "testValue"
    }
  };
  /**
   *
   * @type {{test: string, obj: {test: string}}}
   */
  public params: any = {
    test: "testValue",
    obj: {
      test: "testValue"
    }
  };
  public session: any = {
    test: "testValue",
    obj: {
      test: "testValue"
    }
  };

  public headers: any = {
    "content-type": "application/json",
    accept: "application/json"
  };
  public $ctx: PlatformContext;
  public log: {[key: string]: SinonStub};
  public isAuthenticated: SinonStub;

  [key: string]: any;

  constructor({logger, method, data, endpoint, sandbox = Sinon, headers, params, session, cookies, query, body, id, url, secure}: any = {}) {
    logger = logger || {
      debug: sandbox.stub(),
      info: sandbox.stub(),
      warn: sandbox.stub(),
      error: sandbox.stub(),
      trace: sandbox.stub(),
      flush: sandbox.stub()
    };

    this.$ctx = new PlatformContext({
      id: id || "id",
      url: url || "url",
      logger
    });

    this.$ctx.data = data;
    this.$ctx.endpoint = endpoint;
    this.log = logger;

    this.isAuthenticated = sandbox.stub();

    this.url = url || this.url;
    this.originalUrl = url;
    this.method = method;
    this.headers = headers || this.headers;
    this.body = body || this.body;
    this.query = query || this.query;
    this.params = params || this.params;
    this.session = session || this.session;
    this.cookies = cookies || this.cookies;
    this.secure = secure;

    sandbox.spy(this, "accepts");
    sandbox.spy(this, "get");
  }

  get(value?: any) {
    return value ? this.headers[value.toLowerCase()] || "headerValue" : this.headers;
  }

  accepts(mime?: string | string[]) {
    return accepts(this).types([].concat(mime as never));
  }
}
