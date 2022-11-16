import { model, Schema, models, Model } from 'mongoose';
import { IMongoSchema } from '../types';
import { IPlayer } from './player';

export interface IMessage extends IMongoSchema {
  phrase: string;
  imageURL: string;
  author: IPlayer;
  round: number;
  gameID: string;
}

// Will know the conversation ordering from the player ordering
export const messageSchema = new Schema<IMessage>({
  phrase: { type: String, required: true },
  imageURL: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
  round: { type: Number, required: true },
  gameID: { type: String, required: true }, // stored only for unique index, not storing a ref to the game
});

messageSchema.index({ author: 1, round: 1, gameID: 1 }, { unique: true });

const Message =
  (models.Message as Model<IMessage>) ||
  model<IMessage>('Message', messageSchema);

export { Message };
