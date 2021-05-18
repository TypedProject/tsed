import {Groups, Property} from "@tsed/schema";
import {expect} from "chai";
import {deserialize, serialize} from "../../src";

class Product {
  @Groups("!creation")
  id: string;

  @Property()
  label: string;

  @Groups("group.summary")
  price: number;

  @Groups("group.extended")
  description: string;
}

describe("Groups", () => {
  describe("deserialize", () => {
    it("should deserialize object without groups restriction", () => {
      const product = deserialize({
        id: "id",
        label: "label",
        price: 100,
        description: "description"
      }, {type: Product});

      expect(product).to.deep.eq({
        id: "id",
        label: "label",
        price: 100,
        description: "description"
      });
    });
    it("should deserialize object with groups restriction (empty array)", () => {
      const product = deserialize({
        id: "id",
        label: "label",
        price: 100,
        description: "description"
      }, {type: Product, groups: []});

      expect(product).to.deep.eq({
        "id": "id",
        "label": "label"
      });
    });
    it("should deserialize object with groups restriction (creation)", () => {
      const product = deserialize({
        id: "id",
        label: "label",
        price: 100,
        description: "description"
      }, {type: Product, groups: ["creation"]});

      expect(product).to.deep.eq({
        "label": "label"
      });
    });
    it("should deserialize object  with groups restriction (groups.summary)", () => {
      const product = deserialize({
        id: "id",
        label: "label",
        price: 100,
        description: "description"
      }, {type: Product, groups: ["group.summary"]});

      expect(product).to.deep.eq({
        id: "id",
        label: "label",
        price: 100
      });
    });
    it("should deserialize object  with groups restriction (group.*)", () => {
      const product = deserialize({
        id: "id",
        label: "label",
        price: 100,
        description: "description"
      }, {type: Product, groups: ["group.*"]});

      expect(product).to.deep.eq({
        id: "id",
        label: "label",
        price: 100,
        description: "description"
      });
    });
  });
  describe("serialize", () => {
    const product = deserialize({
      id: "id",
      label: "label",
      price: 100,
      description: "description"
    }, {type: Product});

    it("should serialize object without groups restriction", () => {
      expect(serialize(product)).to.deep.eq({
        id: "id",
        label: "label",
        price: 100,
        description: "description"
      });
    });
    it("should serialize object with groups restriction (empty array)", () => {
      expect(serialize(product, {groups: []})).to.deep.eq({
        id: "id",
        label: "label"
      });
    });
    it("should serialize object with groups restriction (creation)", () => {
      expect(serialize(product, {groups: ["creation"]})).to.deep.eq({
        label: "label"
      });
    });
    it("should serialize object  with groups restriction (groups.summary)", () => {
      expect(serialize(product, {groups: ["group.summary"]})).to.deep.eq({
        id: "id",
        label: "label",
        price: 100
      });
    });
    it("should deserialize object  with groups restriction (group.*)", () => {
      expect(serialize(product, {groups: ["group.*"]})).to.deep.eq({
        id: "id",
        label: "label",
        price: 100,
        description: "description"
      });
    });
  });
});