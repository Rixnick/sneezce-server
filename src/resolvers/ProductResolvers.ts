import { Product, ProductModel } from "../entities/Product";
import { Query, Resolver, Ctx, Mutation, Arg } from "type-graphql";
import { AppContext } from "../types";
import { isAuthenticated } from "../utils/authHandler";
import { UserModel } from "../entities/User";





@Resolver()
export class ProductResolvers {


  //Query product
  @Query(() => [Product], { nullable: 'items'})
  async products(
    @Ctx() { req }: AppContext
  ): Promise<Product[] | null>{
    try {
      const isUser = await isAuthenticated(req);

      if(!isUser) throw new Error("Please login to proceed...!");

      const products = await ProductModel.find();

      return products;
    } catch (error) {
      throw error;
    }
  }

  //Query user following's products
  @Query(() => [Product], { nullable: 'items'})
  async timelineProducts(
    @Ctx() { req }: AppContext
  ): Promise<Product[] | null> {
    try {
      const isUser = await isAuthenticated(req);

      if(!isUser) throw new Error("Please login to proceed...!");

      const currentUser = await UserModel.findById(isUser._id);

      if(!currentUser) throw new Error("Please login to proceed...!");

      const userProducts = await ProductModel.find({ user: currentUser?._id }).sort({ created_at: -1 });

      const friendProducts = await Promise.all(
        currentUser?.followings.map( async (friendId) => {
          const friendProduct = await ProductModel.find({ user: friendId }).sort({ created_at: -1 });

          return friendProduct;
        })
      );


      const products = userProducts.concat(...friendProducts);

      return products;
    } catch (error) {
      throw error;
    }
  } 


  //create user product
  @Mutation(() => Product, { nullable: true })
  async postProduct(
    @Ctx() { req }: AppContext,
    @Arg("description") description: string,
    @Arg("media") media: string
  ): Promise<Product | null>{
    try {
      
      const isUser = await isAuthenticated(req);

      if(!isUser) throw new Error("Please login to proceed...!");

      const product = await ProductModel.create({
        description,
        media,
        user: isUser._id
      });

      return product;
    } catch (error) {
      throw error;
    }
  }


  //Like and Dislike Product

  
  //Delete Product


  //Update Product

}