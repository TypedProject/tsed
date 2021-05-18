import {HandlerContext, ParamMetadata} from "@tsed/common";
import {createFakePlatformContext} from "./createFakePlatformContext";

export function createFakeHandlerContext(param: ParamMetadata, sandbox: any) {
  const $ctx = createFakePlatformContext(sandbox);

  return new HandlerContext({
    $ctx,
    args: [],
    metadata: {} as any
  });
}
