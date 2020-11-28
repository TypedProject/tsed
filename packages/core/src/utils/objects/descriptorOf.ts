/**
 * Return the descriptor for a given class and propertyKey
 * @param target
 * @param {string} propertyKey
 * @returns {PropertyDescriptor}
 */
export function descriptorOf(target: any, propertyKey: string | symbol): PropertyDescriptor {
  return Object.getOwnPropertyDescriptor((target && target.prototype) || target, propertyKey)!;
}
