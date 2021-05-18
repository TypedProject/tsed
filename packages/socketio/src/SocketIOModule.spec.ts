import {HttpServer, HttpsServer, PlatformTest} from "@tsed/common";
import {PlatformConfiguration} from "@tsed/common";
import {expect} from "chai";
import Sinon from "sinon";
import {SocketIOModule, SocketIOServer, SocketIOService} from "./index";

describe("SocketIOModule", () => {
  let getWebsocketServicesStub: any, printSocketEventsStub: any;
  describe("$afterListen()", () => {
    describe("with http server", () => {
      before(() =>
        PlatformTest.create({
          httpsPort: 8081
        })
      );
      before(() => {
        getWebsocketServicesStub = Sinon.stub(SocketIOModule.prototype as any, "getWebsocketServices");
        printSocketEventsStub = Sinon.stub(SocketIOModule.prototype as any, "printSocketEvents");
      });
      after(() => {
        PlatformTest.reset();
        getWebsocketServicesStub.restore();
        printSocketEventsStub.restore();
      });

      it("should call attach method", async () => {
        const serverSettingsService = PlatformTest.get<PlatformConfiguration>(PlatformConfiguration);
        // GIVEN
        const socketIOServer = {attach: Sinon.stub(), adapter: Sinon.stub()};
        const httpServer = {type: "http", get: Sinon.stub().returns("httpServer")};
        const httpsServer = {type: "https", get: Sinon.stub().returns("httpsServer")};
        const socketIOService = {addSocketProvider: Sinon.stub()};

        serverSettingsService.set("socketIO", {config: "config", adapter: "adapter"});

        const socketIOModule = await PlatformTest.invoke(SocketIOModule, [
          {token: HttpServer, use: httpServer},
          {token: HttpsServer, use: httpsServer},
          {token: SocketIOServer, use: socketIOServer},
          {token: SocketIOService, use: socketIOService}
        ]);

        getWebsocketServicesStub.returns([{provider: "provider"}]);
        // WHEN
        await socketIOModule.$afterListen();

        expect(socketIOServer.attach).to.have.been.calledWithExactly(httpServer, {
          adapter: "adapter",
          config: "config"
        });
        expect(socketIOServer.attach).to.have.been.calledWithExactly(httpsServer, {
          adapter: "adapter",
          config: "config"
        });

        expect(getWebsocketServicesStub).to.have.been.calledWithExactly();
        expect(socketIOServer.adapter).to.have.been.calledWithExactly("adapter");
        expect(socketIOService.addSocketProvider).to.have.been.calledWithExactly({provider: "provider"});
      });
    });
    describe("with https server", () => {
      before(() =>
        PlatformTest.create({
          httpsPort: 8081
        })
      );
      before(() => {
        getWebsocketServicesStub = Sinon.stub(SocketIOModule.prototype as any, "getWebsocketServices");
        printSocketEventsStub = Sinon.stub(SocketIOModule.prototype as any, "printSocketEvents");
      });
      after(() => {
        PlatformTest.reset();
        getWebsocketServicesStub.restore();
        printSocketEventsStub.restore();
      });

      it("should call attach method", async () => {
        const serverSettingsService = PlatformTest.get<PlatformConfiguration>(PlatformConfiguration);

        // GIVEN
        const socketIOServer = {attach: Sinon.stub(), adapter: Sinon.stub()};
        const httpServer = {type: "http", get: Sinon.stub().returns("httpServer")};
        const httpsServer = {type: "https", get: Sinon.stub().returns("httpsServer")};
        const socketIOService = {addSocketProvider: Sinon.stub()};

        serverSettingsService.set("socketIO", {config: "config"});
        serverSettingsService.set("http", false);

        const socketIOModule = await PlatformTest.invoke(SocketIOModule, [
          {token: HttpServer, use: httpServer},
          {token: HttpsServer, use: httpsServer},
          {token: SocketIOServer, use: socketIOServer},
          {token: SocketIOService, use: socketIOService}
        ]);

        getWebsocketServicesStub.returns([{provider: "provider"}]);
        // WHEN
        await socketIOModule.$afterListen();

        expect(socketIOServer.attach).to.have.been.calledWithExactly(httpsServer, {
          config: "config"
        });

        expect(getWebsocketServicesStub).to.have.been.calledWithExactly();
        expect(socketIOService.addSocketProvider).to.have.been.calledWithExactly({provider: "provider"});
      });
    });
  });
});
