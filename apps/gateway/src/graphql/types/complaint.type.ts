import { ObjectType, Field, ID, Float, Int, InputType } from '@nestjs/graphql';

@ObjectType()
export class ComplaintMediaItemType {
  @Field(() => ID)
  id: string;

  @Field()
  url: string;

  @Field({ defaultValue: 'image' })
  type: string;

  @Field({ nullable: true })
  caption?: string;
}

@ObjectType()
export class ComplaintType {
  @Field(() => ID)
  id: string;

  @Field()
  category: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  severity: string;

  @Field()
  status: string;

  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;

  @Field()
  address: string;

  @Field(() => Int, { defaultValue: 0 })
  upvotesCount: number;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;

  @Field(() => [ComplaintMediaItemType], { defaultValue: [] })
  media: ComplaintMediaItemType[];
}

@InputType()
export class CreateComplaintInput {
  @Field()
  category: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  severity: string;

  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;

  @Field()
  address: string;

  @Field(() => [String], { nullable: 'itemsAndList' })
  mediaIds?: string[];
}
