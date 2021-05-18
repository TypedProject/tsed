import type {Type} from "../domain/Type";

export interface MetadataTypes<T = any, C = any> {
  type?: Type<T> | T;
  collectionType?: Type<C> | C;
}
