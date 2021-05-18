import {catchAsyncError} from "@tsed/core";
import {BadRequest} from "@tsed/exceptions";
import {JsonEntityFn, Property} from "@tsed/schema";
import {expect} from "chai";
import {deserialize} from "../../src";
import {BeforeDeserialize} from "../../src/decorators/beforeDeserialize";

class Company {
  @Property()
  name: string;
  @Property()
  @RequiredIf((value: any, data: any) => data.name === "tsed" && value !== undefined)
  location: string;
}

function RequiredIf(cb: any): PropertyDecorator {
  return JsonEntityFn((store, [target, propertyKey]) => {
    BeforeDeserialize((data) => {
      if (!cb(data[propertyKey], data)) {
        throw new BadRequest(`${String(propertyKey)} is required`);
      }
      return data;
    })(target);
  });
}

describe("CustomValidationDecorator", () => {
  it("should deserialize object correctly", async () => {
    // GIVEN
    const company = {
      name: "tsed",
      location: "Paris"
    };

    // WHEN
    const companyAfterDeserialization = deserialize(company, {type: Company});

    // THEN
    expect(companyAfterDeserialization).to.be.deep.eq({
      name: "tsed",
      location: "Paris"
    });
  });

  it("should try to deserialize and throw a bad request error", async () => {
    // GIVEN
    const company = {
      name: "tsed"
    };

    // WHEN
    const badRequestError = await catchAsyncError(() => deserialize(company, {type: Company}));

    // THEN
    expect(badRequestError).to.be.instanceof(BadRequest);
  });
});
