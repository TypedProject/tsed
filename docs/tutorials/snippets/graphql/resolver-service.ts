import {Inject} from "@tsed/di";
import {ResolverService} from "@tsed/graphql";
import {Arg, Args, Query} from "type-graphql";
import {RecipeNotFoundError} from "../errors/RecipeNotFoundError";
import {RecipesService} from "../services/RecipesService";
import {Recipe} from "../types/Recipe";
import {RecipesArgs} from "../types/RecipesArgs";

@ResolverService(Recipe)
export class RecipeResolver {
  @Inject()
  private recipesService: RecipesService;

  @Query(returns => Recipe)
  async recipe(@Arg("id") id: string) {
    const recipe = await this.recipesService.findById(id);
    if (recipe === undefined) {
      throw new RecipeNotFoundError(id);
    }

    return recipe;
  }

  @Query(returns => [Recipe])
  recipes(@Args() {skip, take}: RecipesArgs) {
    return this.recipesService.findAll({skip, take});
  }
}
