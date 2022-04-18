import { getModelForClass, prop } from '@typegoose/typegoose';
import { RoleOptions, AccStatus } from '../types';
import { ObjectType, Field, ID } from 'type-graphql';


@ObjectType({ description: 'User Model'})
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  @prop({ required: true, trim: true, unique: true})
  username: string;

  @Field()
  @prop({ required: true, trim: true, lowercase: true, unique: true })
  email: string;

  @prop({ required: true})
  password: string;

  @Field((_type) => String)
  @prop({ default: '' })
  firstname: string;

  @Field((_type) => String)
  @prop({ default: '' })
  lastname: string;

  @Field((_type) => String)
  @prop({ default: '' })
  mobile: string;

  @Field((_type) => String)
  @prop({ default: '' })
  image: string;

  @Field((_type) => String)
  @prop({ default: '' })
  address: string;

  @Field((_type) => String)
  @prop({ default: '' })
  hometown: string;

  @Field((_type) => String)
  @prop({ default: '' })
  cover: string;


  //Current using detected --> Browser
  @Field((_type) => String)
  @prop({ default: '' })
  browser: string;


  //Current using detected --> location, timestamp
  @Field((_type) => String)
  @prop({ default: '' })
  location: string;


  //Current using detected --> Device
  @Field((_type) => String)
  @prop({ default: '' })
  platform: string;


  @Field((_type) => String)
  @prop({ default: '' })
  active_at: string;


  @Field(() => [String])
  @prop({ type: [String]})
  friends: String[];

  @Field(() => [String])
  @prop({ type: [String]})
  followers: String[];

  @Field(() => [String])
  @prop({ type: [String]})
  followings: String[];

  //system role and account status
  @Field(() => [String])
  @prop({ type: String, enum: RoleOptions, default: [RoleOptions.client]})
  roles: RoleOptions[];

  @Field(() => String)
  @prop({ type: String, enum: AccStatus, default: AccStatus.active})
  account: AccStatus;


  @Field(() => String)
  @prop({ type: Boolean, default: true})
  isOnline: Boolean;

  //System Modifier
  @prop({ default: 0 })
  tokenVersion: number;

  @prop()
  resetPasswordToken: string;

  @prop()
  resetPasswordTokenExpiry: number;

  @Field()
  @prop({ default: () => Date.now()})
  updated_at: Date;

  @Field()
  @prop({ default: () => Date.now()})
  created_at: Date;
}

export const UserModel = getModelForClass(User);