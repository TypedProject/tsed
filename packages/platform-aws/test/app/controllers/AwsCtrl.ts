import {Controller, Get} from "@tsed/common";
import {AwsContext, AwsEvent} from "../../../src";

@Controller("/aws")
export class AwsCtrl {
  @Get("/")
  get(@AwsEvent() event: any, @AwsContext() context: any) {
    return {event, context};
  }
}
