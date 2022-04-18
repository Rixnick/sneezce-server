import { Service, ServiceModel } from "../entities/Service";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { isAuthenticated } from "../utils/authHandler";
import { AppContext } from "src/types";
import { ResponseMessage } from "./AuthResolvers";
import { UserModel } from "../entities/User";




@Resolver()
export class ServiceResolver {

  //Query All Service
  @Query(() => [Service], { nullable: 'items'})
  async service(
    @Ctx() { req }: AppContext
  ): Promise<Service[] | null>{
    try {
      const isUser = await isAuthenticated(req);

      if(!isUser) throw new Error('Please login to proceed...!');

      const services = await ServiceModel.find();
      
      return services;
    } catch (error) {
      throw error
    }
  }

  //Create User Service
  @Mutation(() => Service, { nullable: true })
  async addService(
    @Ctx() { req }: AppContext,
    @Arg("name") name: string,
    @Arg("contact") contact: string,
    @Arg("address") address: string,
    @Arg("category") category: string,
  ): Promise<Service | null> {
    try {

      const isUser = await isAuthenticated(req);

      if(!isUser) throw new Error("Please login to proceed...!");
      
      const service = await ServiceModel.create({
        name,
        contact,
        address,
        category,
        user: isUser._id
      })

      return service;

    } catch (error) {

      throw error;

    }
  }

  //Update User Service


  //Delete User Service
  @Mutation(() => ResponseMessage, {nullable: true})
  async deleteService(
    @Ctx() { req }: AppContext,
    @Arg("serviceId") serviceId: string,
  ): Promise<ResponseMessage | null>{
    try {
      const isUser = await isAuthenticated(req);

      if(!isUser) throw new Error("Please login to proceed...!");

      const service = await ServiceModel.findById(serviceId);

      if(service?.user !== isUser.id) {
        throw new Error("You are not authorizated...!")
      }else{
        await ServiceModel.findByIdAndDelete(serviceId);

        return { message: 'Service has been deleted...!'};
      }

    } catch (error) {
      throw error;
    }
  }


  //Query Following services
  @Query(() => [Service], { nullable: 'items'})
  async timelineService(
    @Ctx() { req }: AppContext
  ): Promise<Service[] | null> {
    try {
      const isUser = await isAuthenticated(req);

      if(!isUser) throw new Error("Please login to proceed...!");

      const currentUser = await UserModel.findById(isUser._id);

      if(!currentUser) throw new Error("Please login to proceed...!");

      const userService = await ServiceModel.find({ user: currentUser?.id }).sort({ created_at: -1});

      const friendServices = await Promise.all(
        currentUser.followings.map( async (friendId) => {
          const friendService = await ServiceModel.find({ user: friendId }).sort({ created_at: -1});

          return friendService;
        })
      );

      const services = userService.concat(...friendServices);

      return services;

    } catch (error) {
      throw error;
    }
  }

}