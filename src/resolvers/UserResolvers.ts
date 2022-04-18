import { User, UserModel } from "../entities/User";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { AppContext } from "src/types";
import { isAuthenticated } from "../utils/authHandler";
import { ResponseMessage } from "./AuthResolvers";



@Resolver()
export class UserResolvers {

  //Super admin manager this section
  @Query(() => [User], { nullable: 'items'})
  async users(
    @Ctx() { req }: AppContext
  ): Promise<User[] | null> {
    try {
      const user = await isAuthenticated(req);

      if(!user) throw new Error("Please login to proceed...!")

      return UserModel.find()
    } catch (error) {
      throw error;
    }
  }


  //Query single user from User ID
  @Query(() => User, { nullable: true })
  async user(
    @Arg("userId") userId: string,
    @Ctx() { req }: AppContext
  ): Promise<User | null> {
    try {
      const isUser = await isAuthenticated(req);

      if(!isUser) throw new Error("Please login to proceed...!")

      const user = await UserModel.findById({ _id: userId });

      return user;

    } catch (error) {

      throw error;

    }
  }

  //Query loggedin user data
  @Query(() => User, { nullable: true })
  async me(
    @Ctx() { req }: AppContext
  ): Promise<User | null>{
    try {
      const isUser = await isAuthenticated(req);

      if(!isUser) throw new Error("Please login to proceed...!");

      const user = await UserModel.findById({ _id: isUser._id});
      
      return user;
    } catch (error) {
      throw error;
    }
  }

  //Query user follower
  @Query(() => [User], { nullable: 'items'})
  async followers(
    @Ctx() { req }: AppContext
  ): Promise<User[] | null > {
    try {
      const isUser = await isAuthenticated(req);

      //check if not loggedin user --> is not Authorizated..
      if(!isUser) throw new Error("Please login to proceed...!");

      const currentUser = await UserModel.findById(isUser._id);

      if(!currentUser) throw new Error("You are not authorizated...!");

      const user = await UserModel.find({ _id: currentUser._id })

      //query user followers from
      const followers = await Promise.all(
        currentUser?.followers.map( async (followerId) => {
          const myFollower = await UserModel.find({ _id: followerId }).sort({ created_at: -1 });

          return myFollower;
        })
      )

      const myFollowers = user.concat(...followers)

      return myFollowers;
    } catch (error) {
      throw error;
    }
  }


  //query user following
  @Query(() => [User], { nullable: 'items'})
  async followings(
    @Ctx() { req }: AppContext
  ): Promise<User[] | null > {
    try {
      const isUser = await isAuthenticated(req);

      //check if not loggedin user --> is not Authorizated..
      if(!isUser) throw new Error("Please login to proceed...!");

      const currentUser = await UserModel.findById(isUser._id);

      if(!currentUser) throw new Error("You are not authorizated...!");

      const user = await UserModel.find({ _id: currentUser._id })

      //query user followers from
      const followings = await Promise.all(
        currentUser?.followings.map( async (followerId) => {
          const myFollower = await UserModel.find({ _id: followerId }).sort({ created_at: -1 });

          return myFollower;
        })
      )

      const myFollowers = user.concat(...followings)

      return myFollowers;
    } catch (error) {
      throw error;
    }
  }



  //Current loggedin User Suggestions following from friend
  @Query(() => [User], { nullable: 'items'})
  async suggested(
    @Ctx() { req }: AppContext
  ): Promise<User[] | null> {
    try {
      const isUser = await isAuthenticated(req);

      if(!isUser) throw new Error("Please login to proceed...!");

      const currentUser = await UserModel.findById(isUser._id);

      if(!currentUser) throw new Error("Please login to proceed...!");

      const friends = await UserModel.find({ _id: currentUser.followings });

      const suggestUser = await Promise.all(
        currentUser.followings.map( async (suggestId) => {
          const suggestFriend = await UserModel.find({ _id: suggestId });
          return suggestFriend;
        })
      )

      // console.log("list of suggestions:", suggestUser)

      const suggestions = friends.concat(...suggestUser)

      return suggestions;
    } catch (error) {
      throw error;
    }
  }

  //Follower User
  @Mutation(() => ResponseMessage, { nullable: true })
  async follow(
    @Arg("userId") userId: string,
    @Ctx() { req }: AppContext
  ): Promise<ResponseMessage | null> {
    try {
      const isUser = await isAuthenticated(req);

      if (!isUser) throw new Error("Not authenticated...!");

      const id = isUser.id;

      const user = await UserModel.findById({ _id: id });

      //check if user loggedin is not current following
      if (!user) {
        throw new Error("Login to proceed...!");
      } else if (user.id !== userId) {
        const currentUser = await UserModel.findById({ _id: userId });

        if (!user.followings.includes(userId)) {
          //update following user to my account
          await user.updateOne({
            $push: {
              followings: currentUser?.id,
            },
          });

          //update follower user to current User account
          await currentUser?.updateOne({
            $push: {
              followers: user.id,
            },
          });
        } else {
          throw new Error("You already to followed...!");
        }
      } else {
        throw new Error("You can not follow yourself...!");
      }

      return { message: "You have done followed..." };
    } catch (error) {
      throw error;
    }
  }

  //Unfollower User
  @Mutation(() => ResponseMessage, { nullable: true })
  async unfollow(
    @Arg("userId") userId: string,
    @Ctx() { req }: AppContext
  ): Promise<ResponseMessage | null> {
    try {
      const isUser = await isAuthenticated(req);

      if (!isUser) throw new Error("Not authenticated...!");

      const id = isUser.id;

      const user = await UserModel.findById({ _id: id });

      //check if user loggedin is not current following
      if (!user) {
        throw new Error("Login to proceed...!");
      } else if (user.id !== userId) {
        const currentUser = await UserModel.findById({ _id: userId });

        if (user.followings.includes(userId)) {
          //update unfollowing user to my account
          await user.updateOne({
            $pull: {
              followings: currentUser?.id,
            },
          });

          //update unfollower user to current User account
          await currentUser?.updateOne({
            $pull: {
              followers: user.id,
            },
          });
        } else {
          throw new Error("You already to unfollowed...!");
        }
      } else {
        throw new Error("You can not unfollow yourself...!");
      }

      return { message: "You have done unfollowed..." };
    } catch (error) {
      throw error;
    }
  }


  //update user profile image


  //update user cover image

  

  //update user current address


  //update user firstname lastname
}
