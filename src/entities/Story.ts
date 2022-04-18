import { getModelForClass, prop } from '@typegoose/typegoose';
import { ObjectType, Field, ID } from 'type-graphql';


@ObjectType({ description: 'Story Model'})
export class Story {
  @Field(() => ID)
  id: string;

  @Field()
  @prop()
  content: string;

  @Field((_type) => String)
  @prop({ default: '' })
  image: string;  

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

export const StoryModel = getModelForClass(Story);