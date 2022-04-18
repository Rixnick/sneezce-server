import { Snigger, SniggerModel } from "../entities/Snigger";
import { AppContext } from "../types";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { isAuthenticated } from "../utils/authHandler";
import { ResponseMessage } from "./AuthResolvers";
import { UserModel } from "../entities/User";





@Resolver()
export class SniggerResolver {

  //Query Scream
  @Query(() => [Snigger], { nullable: 'items' })
  async sniggers(
    @Ctx() { req }: AppContext
  ): Promise<Snigger[] | null>{
    try {
      const isUser = await isAuthenticated(req);

      if(!isUser) throw new Error("Please login to proceed...!");

      const sniggers = await SniggerModel.find();
      
      return sniggers;

    } catch (error) {
      throw error;
    }
  }


  //Query my owner Snigger
  @Query(() => [Snigger], { nullable: 'items'})
  async mytimeline(
    @Ctx() { req }: AppContext
  ): Promise<Snigger[] | null> {
    try {
      const isUser = await isAuthenticated(req);

      if(!isUser) throw new Error("Please login to proceed...!");

      const mySniggers = await SniggerModel.find({ user: isUser._id }).sort({ created_at: -1 });

      return mySniggers;

    } catch (error) {
      throw error;
    }
  }

  //Create Scream Post
  @Mutation(() => Snigger, { nullable: true })
  async postSnigger(
    @Ctx() { req }: AppContext,
    @Arg("content") content: string,
    @Arg("media") media: string
  ): Promise<Snigger | null> {
    try {
      const isUser = await isAuthenticated(req);

      if(!isUser) throw new Error("Please login to proceed...!");

      const snigger = await SniggerModel.create({
        content,
        media,
        user: isUser._id
      });

      return snigger;

    } catch (error) {

      throw error;

    }
  }


  //Update Screate
  @Mutation(() => ResponseMessage, {nullable: true})
  async updateSnigger(
    @Ctx() { req }: AppContext,
    @Arg("sniggerId") sniggerId: string,
    @Arg("content") content: string
  ): Promise<ResponseMessage | null> {
    try {
      const isUser = await isAuthenticated(req);

      if(!isUser) throw new Error("Please signin to proceed...!")

      const snigger = await SniggerModel.findById(sniggerId);

      if(snigger?.user !== isUser.id) {
        throw new Error("You are not authorizated...!");
      }else{
        await snigger?.update({ $set: { content:content }});

        return { message: "Snigger has been updated...!"};
      }
      
    } catch (error) {

      throw error;

    }
  }


  //Delete Scream
  @Mutation(() => ResponseMessage, {nullable: true})
  async deleteSnigger(
    @Ctx() { req }: AppContext,
    @Arg("sniggerId") sniggerId: string,
  ): Promise<ResponseMessage | null>{
    try {
      const isUser = await isAuthenticated(req);

      if(!isUser) throw new Error("Please login to proceed...!");

      const snigger = await SniggerModel.findById(sniggerId);

      if(snigger?.user !== isUser.id){
        throw new Error("You are not authorizated...!")
      }else{
        await SniggerModel.findByIdAndDelete(sniggerId);

        return { message: "Snigger has been deleted...!"};
      }
    } catch (error) {
      throw error;
    }
  }



  //Like and Dislike scream
  @Mutation(() => ResponseMessage, { nullable: true })
  async likeSnigger(
    @Ctx() { req }: AppContext,
    @Arg("sniggerId") sniggerId: string
  ): Promise<ResponseMessage | null> {
    try {
      const isUser = await isAuthenticated(req);

      if(!isUser) throw new Error("Please login to proceed...!");

      const snigger = await SniggerModel.findById(sniggerId);


      if(!snigger?.likes.includes(isUser._id)){
        await snigger?.updateOne({ $push: { likes: isUser._id }});

        return { message: "The snigger has been liked...!"};
      }else{
        await snigger?.updateOne({ $pull: { likes: isUser._id }});

        return { message: "The snigger has been disliked...!"};
      }
    } catch (error) {
      throw error;
    }
  }


  //Get Time screams
  @Query(() => [Snigger], { nullable: 'items' })
  async timelineSnigger(
    @Ctx() { req }: AppContext
  ): Promise<Snigger[] | null>{
    try {
      const isUser = await isAuthenticated(req);

      if(!isUser) throw new Error("Please login to proceed...!");

      const currentUser = await UserModel.findById(isUser._id);

      if(!currentUser) throw new Error("Please login to proceed...!");

      const userSniggers = await SniggerModel.find({ user: currentUser?._id }).sort({ created_at: -1 });

      const friendSniggers = await Promise.all(
        currentUser?.followings.map( async (friendId) => {
          const friendScream = await SniggerModel.find({ user: friendId }).sort({ created_at: -1 });

          return friendScream;
        })
      );

      const sniggers = userSniggers.concat(...friendSniggers);
      // const sniggers = friendSniggers.concat(...userSniggers)

      return sniggers;
    } catch (error) {
      throw error;
    }
  }

}