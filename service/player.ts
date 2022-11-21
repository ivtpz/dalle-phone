import { ObjectId } from 'mongodb';
import { HydratedDocument, ObjectId as TObjectId } from 'mongoose';
import { IPlayer, Player } from '../db/schemas/player';
import { IPlayerOrdering, PlayerOrdering } from '../db/schemas/playerOrdering';
import { IGame } from '../db/schemas/game';

const easterEggName = process.env.FREELOADER_PLAYER_NAME || '';

export interface IPlayerData {
  id: TObjectId;
  _id: TObjectId;
  name: string;
  freeloader: boolean;
}

const toPlayer = (player: HydratedDocument<IPlayer>) => ({
  _id: player._id,
  id: player._id,
  name: player.name,
  freeloader: !!player.name.match(new RegExp(easterEggName, 'gi')),
});

export async function getById(id: string) {
  const player = await Player.findById(id);
  return player ? toPlayer(player) : null;
}

export async function create(name: string): Promise<IPlayerData | null> {
  try {
    const player = await Player.create({
      name,
    });
    return player ? toPlayer(player) : null;
  } catch (e) {
    return null;
  }
}

export async function createPlayerOrdering(game: HydratedDocument<IGame>) {
  const orderedPlayers: Record<string, boolean> = {};
  const gameID = game._id.toString();

  const gameWithPlayers = await game.populate('players');
  const players = gameWithPlayers.players as HydratedDocument<IPlayer>[];

  const playerOrderings: HydratedDocument<IPlayerOrdering>[] =
    await Promise.all(
      players
        .filter((player) => {
          const exists = orderedPlayers[player?._id?.toString() || ''];
          orderedPlayers[player?._id?.toString() || ''] = true;
          return !exists;
        })
        .map(async (player) =>
          PlayerOrdering.create({ current: player, gameID })
        )
    );

  return Promise.all(
    playerOrderings.map(async (po, i) => {
      // eslint-disable-next-line no-param-reassign
      po.next = playerOrderings[i + 1] || playerOrderings[0];
      // eslint-disable-next-line no-param-reassign
      po.previous =
        i === 0
          ? playerOrderings[playerOrderings.length - 1]
          : playerOrderings[i - 1];
      await po.save();
      return po;
    })
  );
}

export async function getPreviousPlayerID(playerID: string, gameID: string) {
  const playerOrdering = await PlayerOrdering.findOne({
    gameID,
    current: new ObjectId(playerID),
  })
    .populate('previous')
    .exec();
  return playerOrdering?.previous.current.toString();
}
