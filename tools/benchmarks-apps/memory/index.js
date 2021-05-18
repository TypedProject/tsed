const {printMemory} = require("../printMemory");
printMemory("init");

require("@tsed/core");
printMemory("@tsed/core");

require("@tsed/schema");
printMemory("@tsed/schema");

require("@tsed/json-mapper");
printMemory("@tsed/json-mapper");

require("@tsed/di");
printMemory("@tsed/di");

require("@tsed/common");
printMemory("@tsed/common");

require("@tsed/platform-express");
printMemory("@tsed/platform-express");
