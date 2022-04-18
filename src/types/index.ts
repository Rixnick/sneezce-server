import { Request, Response } from 'express';

import { ObjectId } from "mongodb";
export type Ref<T> = T | ObjectId

export enum RoleOptions {
  client = 'CLIENT',
  editor = 'EDITOR',
  admin = 'ADMIN',
  super = 'SUPER'
}

export enum AccStatus {
  active = 'ACTIVE',
  ban = 'BAN',
  public = 'PUBLIC',
  private = 'PRIVATE',
  suspened = 'SUSPENED',
  terminated = 'TERMINATED'
}

//Create App Request to extends express request to put userId and tokenVersion
export interface AppRequest extends Request {
  userId?: string
  tokenVersion?:number
  // userProfile?: FBProfile | GGProfile //type facebook user Profile 
}

export interface AppContext {
  req: AppRequest
  res: Response
}