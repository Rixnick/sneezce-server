import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageLocalDefault,
} from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { AuthResolvers } from "./resolvers/AuthResolvers";
import { ProductResolvers } from "./resolvers/ProductResolvers";
import { ScreamResolver } from "./resolvers/ScreamResolver";
import { ServiceResolver } from "./resolvers/ServiceResolvers";
import { SniggerResolver } from "./resolvers/SniggerResolvers";
import { StoryResolver } from "./resolvers/StoryResolver";
import { UserResolvers } from "./resolvers/UserResolvers";
import { AppContext } from './types';
import { verifyToken } from "./utils/tokenHanler";




export default async () => {
  //Schema Builder
  const schema = await buildSchema({
    resolvers: [
      AuthResolvers,
      UserResolvers,
      ScreamResolver,
      SniggerResolver,
      ServiceResolver,
      StoryResolver,
      ProductResolvers
    ],
    emitSchemaFile: { path: "./src/schema.graphql" },
    validate: false,
  });

  //Return new apollo server
  return new ApolloServer({
    schema,
    plugins: [
      process.env.NODE_ENV === "production"
        ? ApolloServerPluginLandingPageLocalDefault()
        : ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
    context: ({req, res}: AppContext) => {
      //Query Cookie from header
      const token = req.cookies[process.env.COOKIE_NAME!]

      //Check user Authentication token
      if(token) {
        try {
          //Verify Token
          const decodedToken = verifyToken(token) as {
            userId: string
            tokenVersion: number
            iat: number
            exp: number
          } | null
  
          //check ready have decodedToken
          if(decodedToken) {
            req.userId = decodedToken.userId
            req.tokenVersion = decodedToken.tokenVersion
          }
        } catch (error) {
          req.userId = undefined
          req.tokenVersion = undefined
        }
      }
  
      return {req, res}
    }});
};
