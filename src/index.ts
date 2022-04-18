import { config } from 'dotenv';
config();
import 'reflect-metadata';
import express from 'express';
import mongoose from 'mongoose';
import cookieParse from 'cookie-parser';
// import cors from 'cors';

const app = express();
const port = process.env.PORT || 4000;
const uri = process.env.DB_URI;
const frontend_uri = process.env.FRONTEND_URI!;

//Import apolloServer
import apolloServer from './apolloServer';

const startServer = async () => {
   //Databse Connection
   await mongoose.connect(`${uri}`);

  
  //App Middleware
  app.use(cookieParse());
  // app.use(cors());


  //Create apolloserver
  const server = await apolloServer();

  await server.start();

  server.applyMiddleware({ app, 
      cors: {
        origin: frontend_uri,
        credentials: true
      } 
  })

  app.listen(port, () => {
    console.log(`🚀Server started: http://localhost:${port}${server.graphqlPath}`)
  })
}

startServer();