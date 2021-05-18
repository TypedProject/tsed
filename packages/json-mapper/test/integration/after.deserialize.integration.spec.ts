import {catchAsyncError} from "@tsed/core";
import {BadRequest} from "@tsed/exceptions";
import {Enum, Property} from "@tsed/schema";
import {expect} from "chai";
import {deserialize} from "../../src";
import {AfterDeserialize} from "../../src/decorators/afterDeserialize";
import {FoodStatus} from "../helpers/FoodStatus";

@AfterDeserialize((data: Food) => {
  if (data.status === FoodStatus.EXPIRED || data.status === FoodStatus.MOLDY) {
    throw new BadRequest(`The food cannot be ${data.status}`);
  } else if (data.name === "Apple" && data.status === FoodStatus.FRESH) {
    data.name = "Thanks for your fresh Apple!";
  }
  return data;
})
export class Food {
  @Property()
  name: string;

  @Property()
  @Enum(FoodStatus)
  status: FoodStatus;
}

describe("AfterDeserialize", async () => {
  it("should deserialize object correctly and alter the name after deserialization", ()  => {
    // GIVEN
    const food: Food = {
      name: "Apple",
      status: FoodStatus.FRESH
    };

    // WHEN
    const foodAfterDeserialization = deserialize(food, {type: Food});

    // THEN
    expect(foodAfterDeserialization).to.be.deep.eq({
      name: "Thanks for your fresh Apple!",
      status: FoodStatus.FRESH
    });
  });

  it("should deserialize object correctly without data manipulation", () => {
    // GIVEN
    const food: Food = {
      name: "Potato",
      status: FoodStatus.FRESH
    };

    // WHEN
    const foodAfterDeserialization = deserialize(food, {type: Food});

    // THEN
    expect(foodAfterDeserialization).to.be.deep.eq({
      name: "Potato",
      status: FoodStatus.FRESH
    });
  });

  it("should throw an BadRequest after deserialization", async () => {
    // GIVEN
    const food: Food = {
      name: "Apple",
      status: FoodStatus.MOLDY
    };

    // WHEN
    const badRequestError = await catchAsyncError(() => deserialize(food, {type: Food}));

    // THEN
    expect(badRequestError).to.be.instanceof(BadRequest);
  });
});
