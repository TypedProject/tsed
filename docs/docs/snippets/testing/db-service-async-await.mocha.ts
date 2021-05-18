import {PlatformTest} from "@tsed/common";
import {expect} from "chai";
import {DbService} from "../services/db";

describe("DbService", () => {
  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  it("should data from db", async () => {
    const dbService = await PlatformTest.get<DbService>(DbService);
    const result = await dbService.getData();
    expect(result).to.be.an("object");
  });
});
