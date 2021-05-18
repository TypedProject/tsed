import {CollectionOf} from "@tsed/schema";
import {Model, ObjectID, Ref} from "../../../src";
import {SelfUser} from "./User";

@Model({ schemaOptions: { timestamps: true } })
export class TestClient {
  @ObjectID()
  _id: string;

  @Ref(() => SelfUser)
  @CollectionOf(() => SelfUser)
  users: Ref<SelfUser>;
}