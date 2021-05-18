export type DecoratorParameters = [any, string | symbol, number | PropertyDescriptor];
export type DecoratorMethodParameters = [any, string | symbol, PropertyDescriptor];
export type StaticMethodDecorator = <TFunction extends Function, T>(
  target: TFunction,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T> | void;
