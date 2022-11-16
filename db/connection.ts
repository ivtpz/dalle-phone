import { ServerApiVersion } from 'mongodb';
import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
  cached = { conn: null, promise: null };
  global.mongoose = cached;
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_CLUSTER}.mongodb.net?retryWrites=true&w=majority`;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
  autoIndex: true,
};

const dbConnect = async () => {
  if (cached.conn) {
    return cached.conn;
  }
  cached.promise = mongoose.connect(uri, options).then((m) => m);
  cached.conn = await cached.promise;
  return cached.conn;
};

export default dbConnect;
