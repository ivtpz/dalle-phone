import { model, Schema, models, Model } from 'mongoose';
import { IMongoSchema } from '../types';

export interface IPlayer extends IMongoSchema {
  name: string;
}

export const playerSchema = new Schema<IPlayer>({
  name: String,
});

const Player =
  (models.Player as Model<IPlayer>) || model<IPlayer>('Player', playerSchema);

export { Player };
