import { ObjectId } from 'mongodb';
import { HydratedDocument, ObjectId as TObjectId } from 'mongoose';
import { IPlayer, Player } from '../db/schemas/player';
import { PlayerOrdering } from '../db/schemas/playerOrdering';
import { IGame } from '../db/schemas/game';

export type PlayerData = {
  id: TObjectId;
  name: string;
};

export async function getById(id: string) {
  return Player.findById(id);
}

export async function create(
  name: string
): Promise<{ id: TObjectId; name: string } | null> {
  try {
    const player = await Player.create({
      name,
    });
    return { id: player._id, name: player.name };
  } catch (e) {
    return null;
  }
}

export async function createPlayerOrdering(game: HydratedDocument<IGame>) {
  const orderedPlayers: Record<string, boolean> = {};
  const gameID = game._id.toString();

  const gameWithPlayers = await game.populate('players');
  const players = gameWithPlayers.players as HydratedDocument<IPlayer>[];

  const playerOrderings = await Promise.all(
    players
      .filter((player) => {
        const exists = orderedPlayers[player?._id?.toString() || ''];
        orderedPlayers[player?._id?.toString() || ''] = true;
        return !exists;
      })
      .map(async (player) => PlayerOrdering.create({ current: player, gameID }))
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
