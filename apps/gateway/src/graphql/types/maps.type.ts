import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class PlaceResultType {
  @Field(() => ID)
  id: string;

  @Field()
  placeName: string;

  @Field()
  address: string;

  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;
}

@ObjectType()
export class ReverseGeocodeType {
  @Field()
  address: string;

  @Field()
  placeName: string;

  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;
}
