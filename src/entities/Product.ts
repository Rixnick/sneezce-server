import { getModelForClass, prop } from '@typegoose/typegoose';
import { ObjectType, Field, ID } from 'type-graphql';

@ObjectType({ description: 'Product Model'})
export class Product {
  @Field(() => ID)
  id: string;

  @Field()
  @prop()
  description: string;


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
  service: string;

  @Field()
  @prop()
  user: string;
}

export const ProductModel = getModelForClass(Product);