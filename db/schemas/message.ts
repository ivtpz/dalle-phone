import { model, Schema, models, Model } from 'mongoose';
import { IPlayer } from './player';

export interface IMessage {
  phrase: string;
  imageURL: string;
  author: IPlayer;
  round: number;
  gameID: string;
}

// Will know the conversation ordering from the player ordering
export const messageSchema = new Schema<IMessage>({
  phrase: String,
  imageURL: String,
  author: { type: Schema.Types.ObjectId, ref: 'Player' },
  round: Number,
  gameID: String, // stored only for unique index, not storing a ref to the game
});

messageSchema.index({ author: 1, round: 1, gameID: 1 }, { unique: true });

const Message =
  (models.Message as Model<IMessage>) ||
  model<IMessage>('Message', messageSchema);

export { Message };
