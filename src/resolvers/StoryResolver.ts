import { UserModel } from "../entities/User";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Story, StoryModel } from "../entities/Story";
import { AppContext } from "../types";
import { isAuthenticated } from "../utils/authHandler";




@Resolver()
export class StoryResolver {

  @Query(() => [Story], { nullable: 'items'})
  async stories(
    @Ctx() { req }: AppContext
  ): Promise<Story[] | null> {
    try {
      const isUser = await isAuthenticated(req);

      if(!isUser) throw new Error("Please login to proceed...!");

      const currentUser = await UserModel.findById(isUser._id);

      if(!currentUser) throw new Error("Please login to proceed...!");

      const userStory = await StoryModel.find({ user: currentUser._id }).sort({ created_at: -1 });

      const friendStories = await Promise.all(
        currentUser?.followings.map( async (friendId) => {
          const friendStory = await StoryModel.find({ user: friendId}).sort({ created_at: -1});

          return friendStory;
        })
      );

      const stories = userStory.concat(...friendStories);

      return stories;
    } catch (error) {
      throw error;
    }
  }

  //Mutation
  @Mutation(() => Story, { nullable: true })
  async postStory(
    @Arg("content") content: string,
    @Arg("image") image: string,
    @Ctx() { req }: AppContext
  ): Promise<Story | null> {
    try {
      const isUser = await isAuthenticated(req);

      if(!isUser) throw new Error("Please login to proceed...!");

      const story = await StoryModel.create({
        content,
        image,
        user: isUser._id
      });

      return story;

    } catch (error) {

      throw error;

    }
  }
}