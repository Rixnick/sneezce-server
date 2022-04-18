import { Scream, ScreamModel } from "../entities/Scream";
import { AppContext } from "../types";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { isAuthenticated } from "../utils/authHandler";
import { ResponseMessage } from "./AuthResolvers";
import { UserModel } from "../entities/User";





@Resolver()
export class ScreamResolver {

  //Query Scream
  @Query(() => [Scream], { nullable: 'items' })
  async screams(
    @Ctx() { req }: AppContext
  ): Promise<Scream[] | null>{
    try {
      const isUser = await isAuthenticated(req);

      if(!isUser) throw new Error("Please login to proceed...!");

      const screams = await ScreamModel.find();

      // console.log("Jupyter notebook:")
      
      return screams;
    } catch (error) {
      throw error;
    }
  }

  //Create Scream Post
  @Mutation(() => Scream, { nullable: true })
  async postScream(
    @Ctx() { req }: AppContext,
    @Arg("content") content: string,
    @Arg("media") media: string
  ): Promise<Scream | null> {
    try {
      const isUser = await isAuthenticated(req);

      if(!isUser) throw new Error("Please login to proceed...!");

      const scream = await ScreamModel.create({
        content,
        media,
        user: isUser._id
      });

      return scream;
    } catch (error) {
      throw error;
    }
  }


  //Update Screate
  @Mutation(() => ResponseMessage, {nullable: true})
  async updateScream(
    @Ctx() { req }: AppContext,
    @Arg("screamId") screamId: string,
    @Arg("content") content: string
  ): Promise<ResponseMessage | null> {
    try {
      const isUser = await isAuthenticated(req);

      if(!isUser) throw new Error("Please signin to proceed...!")

      const scream = await ScreamModel.findById(screamId);

      if(scream?.user !== isUser.id) {
        throw new Error("You are not authorizated...!");
      }else{
        await scream?.update({ $set: { content:content }});

        return { message: "Scream has been updated...!"};
      }
      
    } catch (error) {
      throw error;
    }
  }


  //Delete Scream
  @Mutation(() => ResponseMessage, {nullable: true})
  async deleteScream(
    @Ctx() { req }: AppContext,
    @Arg("screamId") screamId: string,
  ): Promise<ResponseMessage | null>{
    try {
      const isUser = await isAuthenticated(req);

      if(!isUser) throw new Error("Please login to proceed...!");

      const scream = await ScreamModel.findById(screamId);

      if(scream?.user !== isUser.id){
        throw new Error("You are not authorizated...!")
      }else{
        await ScreamModel.findByIdAndDelete(screamId);

        return { message: "Scream has been deleted...!"};
      }
    } catch (error) {
      throw error;
    }
  }



  //Like and Dislike scream
  @Mutation(() => ResponseMessage, { nullable: true })
  async likeScream(
    @Ctx() { req }: AppContext,
    @Arg("screamId") screamId: string
  ): Promise<ResponseMessage | null> {
    try {
      const isUser = await isAuthenticated(req);

      if(!isUser) throw new Error("Please login to proceed...!");

      const scream = await ScreamModel.findById(screamId);


      if(!scream?.likes.includes(isUser._id)){
        await scream?.updateOne({ $push: { likes: isUser._id }});

        return { message: "The scream has been liked...!"};
      }else{
        await scream?.updateOne({ $pull: { likes: isUser._id }});

        return { message: "The scream has been disliked...!"};
      }
    } catch (error) {
      throw error;
    }
  }


  //Get Time screams
  @Query(() => [Scream], { nullable: 'items' })
  async timeline(
    @Ctx() { req }: AppContext
  ): Promise<Scream[] | null>{
    try {
      const isUser = await isAuthenticated(req);

      if(!isUser) throw new Error("Please login to proceed...!");

      const currentUser = await UserModel.findById(isUser._id);

      if(!currentUser) throw new Error("Please login to proceed...!");

      const userScreams = await ScreamModel.find({ user: currentUser?._id }).sort({ created_at: -1});

      const friendScreams = await Promise.all(
        currentUser?.followings.map( async (friendId) => {
          const friendScream = await ScreamModel.find({ user: friendId }).sort({ created_at: -1});

          return friendScream;
        })
      );

      const screams = userScreams.concat(...friendScreams);

      return screams;
    } catch (error) { 
      throw error;
    }
  }

}