import {Type} from "../../domain/Type";

/**
 * Get the class constructor
 * @param target
 */
export function getConstructor(target: any): Type<any> {
  return typeof target === "function" ? target : target.constructor;
}

/**
 * Get the class constructor
 * @param target
 */
export function constructorOf(target: any): Type<any> {
  return getConstructor(target);
}
