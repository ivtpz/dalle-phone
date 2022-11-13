import { model, Schema, models, Model } from 'mongoose';
import { nanoid } from 'nanoid';
import { IMongoTimestampedSchema } from '../types';
import { IMessage } from './message';
import { IPlayer } from './player';
import { IPlayerOrdering, playerOrderingSchema } from './playerOrdering';

export interface IGame extends IMongoTimestampedSchema {
  activeRound: number;
  createdBy: IPlayer;
  messages: IMessage[];
  players: IPlayer[];
  playerOrdering: IPlayerOrdering;
}

export const gameSchema = new Schema<IGame>(
  {
    _id: {
      type: String,
      default: () => nanoid(12),
    },
    activeRound: { type: Number, default: 0 }, // 0 indicates waiting to start, -1 indicates done
    createdBy: { type: Schema.Types.ObjectId, ref: 'Player' },
    messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
    players: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
    playerOrdering: playerOrderingSchema,
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        // TODO: Can I get rid of this?
        // Avoid circular dependency
        delete ret.playerOrdering;
      },
    },
  }
);

const Game = (models.Game as Model<IGame>) || model<IGame>('Game', gameSchema);

export { Game };
