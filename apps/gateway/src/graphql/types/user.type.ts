import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';

@ObjectType()
export class UserType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  phone: string;

  @Field()
  role: string;

  @Field({ nullable: true })
  aadhaarNumber?: string;

  @Field({ nullable: true })
  createdAt?: string;
}

@ObjectType()
export class AuthPayloadType {
  @Field()
  accessToken: string;

  @Field(() => UserType)
  user: UserType;
}

@InputType()
export class RegisterInput {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  phone: string;

  @Field()
  password?: string;

  @Field()
  aadhaarNumber: string;
}
