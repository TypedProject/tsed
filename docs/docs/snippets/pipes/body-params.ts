import {ParamTypes, UseParam} from "@tsed/common";
import {mapParamsOptions} from "@tsed/common";

export function BodyParams(...args: any[]): ParameterDecorator {
  const {expression, useType, useConverter = true, useValidation = true} = mapParamsOptions(args);

  return UseParam(
    ParamTypes.BODY, // The first parameters is the starting object (eg: `request.body`)
    {
      expression,
      useType,
      useConverter,
      useValidation
    });
}
