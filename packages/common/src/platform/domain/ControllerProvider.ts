import {Enumerable, NotEnumerable, Type} from "@tsed/core";
import {Provider, ProviderType} from "@tsed/di";
import {JsonEntityStore} from "@tsed/schema";
import {ControllerMiddlewares, EndpointMetadata} from "../../mvc";
import {ROUTER_OPTIONS} from "../constants/routerOptions";
import {PlatformRouterMethods} from "../interfaces/PlatformRouterMethods";

export interface IChildrenController extends Type<any> {
  $parentCtrl?: ControllerProvider;
}

export class ControllerProvider<T = any> extends Provider<T> {
  @NotEnumerable()
  readonly entity: JsonEntityStore;

  #router: PlatformRouterMethods;
  #children: IChildrenController[] = [];

  constructor(provide: any) {
    super(provide);
    this.type = ProviderType.CONTROLLER;
    this.entity = JsonEntityStore.from(provide);
  }

  get path() {
    return this.entity.path;
  }

  @Enumerable()
  set path(path: string) {
    this.entity.path = path;
  }

  /**
   *
   * @returns {Endpoint[]}
   */
  get endpoints(): EndpointMetadata[] {
    return EndpointMetadata.getEndpoints(this.provide);
  }

  /**
   *
   * @returns {Type<any>[]}
   */
  get children(): IChildrenController[] {
    return this.#children;
  }

  /**
   *
   * @param children
   */
  @Enumerable()
  set children(children: IChildrenController[]) {
    this.#children = children;
    this.#children.forEach((d) => (d.$parentCtrl = this));
  }

  /**
   *
   */
  get routerOptions(): any {
    return this.store.get(ROUTER_OPTIONS) || ({} as any);
  }

  /**
   *
   * @param value
   */
  set routerOptions(value: any) {
    this.store.set(ROUTER_OPTIONS, value);
  }

  /**
   *
   * @returns {ControllerProvider}
   */
  get parent() {
    return this.provide.$parentCtrl;
  }

  /**
   *
   * @returns {any[]}
   */
  get middlewares(): ControllerMiddlewares {
    return Object.assign(
      {
        use: [],
        useAfter: [],
        useBefore: []
      },
      this.store.get("middlewares") || {}
    );
  }

  /**
   *
   * @param middlewares
   */
  set middlewares(middlewares: ControllerMiddlewares) {
    const mdlwrs = this.middlewares;
    const concat = (key: string, a: any, b: any) => (a[key] = a[key].concat(b[key]));

    Object.keys(middlewares).forEach((key: string) => {
      concat(key, mdlwrs, middlewares);
    });
    this.store.set("middlewares", mdlwrs);
  }

  /**
   * Resolve final endpoint url.
   */
  public getEndpointUrl(routerPath?: string): string {
    return (routerPath === this.path ? this.path : (routerPath || "") + this.path).replace(/\/\//gi, "/");
  }

  /**
   *
   */
  public hasEndpointUrl() {
    return !!this.path;
  }

  /**
   *
   * @returns {boolean}
   */
  public hasChildren(): boolean {
    return !!this.children.length;
  }

  /**
   *
   * @returns {boolean}
   */
  public hasParent(): boolean {
    return !!this.provide.$parentCtrl;
  }

  public getRouter<T extends PlatformRouterMethods = any>(): T {
    return this.#router as any;
  }

  public setRouter(router: PlatformRouterMethods) {
    this.#router = router;

    return this;
  }
}
