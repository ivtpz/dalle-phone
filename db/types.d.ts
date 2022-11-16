import { Timestamp } from 'mongodb';
import mongoose, { ObjectId } from 'mongoose';

declare global {
  // eslint-disable-next-line
  var mongoose: MongooseConnection;
}

declare interface IMongoSchema {
  _id: ObjectId;
}

declare type Stringified<T extends IMongoSchema> = {
  [Prop in keyof T]: T[Prop] extends ObjectId
    ? string
    : T[Prop] extends IMongoSchema
    ? Stringified<T[Prop]>
    : T[Prop];
};

declare interface IMongoTimestampedSchema extends IMongoSchema {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

type MongooseConnection = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};
