import {PlatformTest} from "@tsed/common";
import {Format, getJsonSchema} from "@tsed/schema";
import {expect} from "chai";
import {AjvService} from "../../src";
import {Formats} from "../../src/decorators/formats";
import {FormatsMethods} from "../../src/interfaces/FormatsMethods";

const NOT_URI_FRAGMENT = /\/|:/;
const URI = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;

@Formats("optional-uri", {type: "string"})
class UriFormat implements FormatsMethods<string> {
  validate(str: string): boolean {
    // http://jmrware.com/articles/2009/uri_regexp/URI_regex.html + optional protocol + required "."
    return str === "" ? true : NOT_URI_FRAGMENT.test(str) && URI.test(str);
  }
}

describe("Formats", () => {
  beforeEach(() => PlatformTest.create());
  afterEach(() => PlatformTest.reset());
  it("should authorize empty string when we load the our custom Formats for AJV", async () => {
    class MyModel {
      @Format("optional-uri")
      uri: string;
    }

    const service = PlatformTest.get<AjvService>(AjvService);
    const jsonSchema = getJsonSchema(MyModel);

    expect(jsonSchema).to.deep.equal({
      "properties": {
        "uri": {
          "format": "optional-uri",
          "type": "string"
        }
      },
      "type": "object"
    });

    const result = await service.validate({uri: ""}, {type: MyModel});

    expect(result).to.deep.eq({uri: ""});
  });
});