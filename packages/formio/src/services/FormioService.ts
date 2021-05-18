import {Inject, Injectable, InjectorService} from "@tsed/common";
import type {MongooseConnectionOptions} from "@tsed/mongoose";
import type {Db} from "mongodb";
import type {Mongoose} from "mongoose";
import {promisify} from "util";
import {Formio} from "../domain/Formio";
import {FormioConfig} from "../domain/FormioConfig";
import {FormioHook, FormioHooks} from "../domain/FormioHooks";
import {FormioSchemas} from "../domain/FormioModels";
import {FormioRouter} from "../domain/FormioRouter";
import {FormioTemplate} from "../domain/FormioTemplate";
import {FormioExportOptions} from "../domain/FormioTemplateUtil";

const createRouter = require("formio");
const swagger = require("formio/src/util/swagger.js");
const util = require("formio/src/util/util.js");

@Injectable()
export class FormioService {
  router: FormioRouter;

  @Inject()
  protected injector: InjectorService;

  get audit(): Function {
    return this.formio.audit || (() => {});
  }

  get auth() {
    return this.formio.auth;
  }

  // istanbul ignore next
  get swagger() {
    return (...args: any[]) => new Promise((resolve) => swagger(...args, resolve));
  }

  get config(): FormioConfig {
    return this.formio.config;
  }

  get db(): Db {
    return this.formio.db;
  }

  get resources() {
    return this.formio.resources;
  }

  get mongoose(): Mongoose {
    return this.formio.mongoose;
  }

  get middleware() {
    return this.formio.middleware;
  }

  get schemas(): FormioSchemas {
    return this.formio.schemas;
  }

  get formio(): Formio {
    return this.router.formio as Formio;
  }

  get hook(): FormioHook {
    return this.formio.hook;
  }

  get util() {
    return this.formio.util;
  }

  get template() {
    return this.formio.template;
  }

  get Action() {
    return this.formio.Action;
  }

  async exportTemplate(options: Partial<FormioExportOptions> = {}): Promise<FormioTemplate> {
    return promisify(this.formio.template.export)(options);
  }

  async importTemplate(template: FormioTemplate): Promise<FormioTemplate> {
    return promisify(this.formio.template.import.template)(template);
  }

  encrypt(text: string) {
    return promisify(this.formio.encrypt)(text);
  }

  isInit() {
    return !!this.router;
  }

  // istanbul ignore next
  public createRouter(options: FormioConfig) {
    return createRouter(options);
  }

  public init(options: FormioConfig, hooks: FormioHooks = {}) {
    if (options && Object.keys(options).length) {
      this.router = this.createRouter(this.mapConfiguration(options));
      this.bindLogger();

      return this.router.init(hooks);
    }
  }

  protected mapConfiguration(options: FormioConfig) {
    const {injector} = this;
    const mongooseSettings = injector.settings.get<MongooseConnectionOptions>("mongoose.0");

    if (mongooseSettings) {
      options.mongo = options.mongo || mongooseSettings.url;
      options.mongoConfig = options.mongoConfig || JSON.stringify(mongooseSettings.connectionOptions);
    }

    return options;
  }

  protected bindLogger() {
    const {injector} = this;

    util.log = injector.logger.info.bind(injector.logger);
    util.error = injector.logger.error.bind(injector.logger);
  }
}
