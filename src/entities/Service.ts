import { getModelForClass, prop } from '@typegoose/typegoose';
import { ObjectType, Field, ID } from 'type-graphql';


@ObjectType({ description: 'Service Model'})
export class Service {
  @Field(() => ID)
  id: string;

  @Field()
  @prop({ required: true, trim: true, unique: true})
  name: string;


  @Field((_type) => String)
  @prop({ default: '' })
  contact: string;


  @Field((_type) => String)
  @prop({ default: '' })
  address: string;


  @Field((_type) =>[String])
  @prop({ type: [String] })
  category: string[];


  @Field((_type) => String)
  @prop({ default: '' })
  image: string;

  @Field((_type) => String)
  @prop({ default: '' })
  cover: string;
  

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

export const ServiceModel = getModelForClass(Service);