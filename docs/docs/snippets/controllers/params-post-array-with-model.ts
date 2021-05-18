import {BodyParams, Controller, Post} from "@tsed/common";
import {Property} from "@tsed/schema";

class Product {
  @Property()
  title: string;
}

@Controller("/products")
export class ProductsCtrl {
  @Post()
  updatePayload(@BodyParams(Product) products: Product[]): Product[] {
    console.log("products", products);

    return products;
  }
}
