import {
  model, Schema, models, Model,
} from 'mongoose';

export interface IPlayer {
  name: string;
}

export const playerSchema = new Schema<IPlayer>({
  name: String,
});

const Player = models.Player as Model<IPlayer> || model<IPlayer>('Player', playerSchema);

export {
  Player,
};
