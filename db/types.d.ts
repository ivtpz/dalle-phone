import { Timestamp } from 'mongodb';
import mongoose from 'mongoose';

declare global {
  // eslint-disable-next-line
  var mongoose: MongooseConnection
};

declare interface IMongoSchema {
  _id: string;
}

declare interface IMongoTimestampedSchema extends IMongoSchema {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

type MongooseConnection = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null
}
