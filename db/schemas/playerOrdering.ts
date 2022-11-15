import { model, Schema, models, Model } from 'mongoose';
import { IPlayer } from './player';

export interface IPlayerOrdering {
  current: IPlayer;
  previous: IPlayerOrdering;
  next: IPlayerOrdering;
  gameID: string;
}

export const playerOrderingSchema = new Schema<IPlayerOrdering>({
  current: { type: Schema.Types.ObjectId, ref: 'Player' },
  previous: { type: Schema.Types.ObjectId, ref: 'PlayerOrdering' },
  next: { type: Schema.Types.ObjectId, ref: 'PlayerOrdering' },
  gameID: String,
});

const PlayerOrdering =
  (models.PlayerOrdering as Model<IPlayerOrdering>) ||
  model<IPlayerOrdering>('PlayerOrdering', playerOrderingSchema);

export { PlayerOrdering };
