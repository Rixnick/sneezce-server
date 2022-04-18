import { getModelForClass, prop } from '@typegoose/typegoose';
import { ObjectType, Field, ID } from 'type-graphql';

@ObjectType({ description: 'Snigger Model'})
export class Snigger {
  @Field(() => ID)
  id: string;

  @Field()
  @prop()
  content: string;


  @Field((_type) => [String])
  @prop({ type: () => [String]})
  media: string[];


  @Field((_type) => [String])
  @prop({ type: () => [String]})
  likes: string[]; //Or User ID


  @Field()
  @prop({ default: () => Date.now()})
  updated_at: Date;

  @Field()
  @prop({ default: () => Date.now()})
  created_at: Date;

  @Field()
  @prop()
  user: string;
}

export const SniggerModel = getModelForClass(Snigger);