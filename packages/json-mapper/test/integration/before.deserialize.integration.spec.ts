import {catchAsyncError} from "@tsed/core";
import {BadRequest} from "@tsed/exceptions";
import {Property} from "@tsed/schema";
import {Enum} from "@tsed/schema";
import {expect} from "chai";
import {deserialize} from "../../src";
import {BeforeDeserialize} from "../../src/decorators/beforeDeserialize";
import {FoodStatus} from "../helpers/FoodStatus";

@BeforeDeserialize((data: Record<string, unknown>) => {
  if (data.status === FoodStatus.EXPIRED || data.status === FoodStatus.MOLDY) {
    throw new BadRequest(`The food cannot be ${data.status}`);
  } else {
    data.name = `The ${data.name} is fresh`;
    return data;
  }
})
class Food {
  @Property()
  name: string;

  @Property()
  @Enum(FoodStatus)
  status: FoodStatus;
}

describe("BeforeDeserialize", async () => {
  it("should deserialize object correctly and alter the name before deserialization", ()  => {
    // GIVEN
    const food: Food = {
      name: "Banana",
      status: FoodStatus.FRESH
    };

    // WHEN
    const foodAfterDeserialization = deserialize(food, {type: Food});

    // THEN
    expect(foodAfterDeserialization).to.be.deep.eq({
      name: "The Banana is fresh",
      status: FoodStatus.FRESH
    });
  });

  it("should throw an BadRequest before deserialization", async () => {
    // GIVEN
    const food: Food = {
      name: "Salad",
      status: FoodStatus.MOLDY
    };

    // WHEN
    const badRequestError = await catchAsyncError(() => deserialize(food, {type: Food}));

    // THEN
    expect(badRequestError).to.be.instanceof(BadRequest);
  });
});
