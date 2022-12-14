import { HydratedDocument } from 'mongoose';
import { IGame } from '../db/schemas/game';
import { IMessage, Message } from '../db/schemas/message';
import { IPlayerOrdering, PlayerOrdering } from '../db/schemas/playerOrdering';
import { Stringified } from '../db/types';
import { IPlayerData } from './player';

/**
 * Creates a message record and adds it to the game's messages.
 *
 * NOTE: Caller must save the game
 */
export async function addMessageToGame(
  game: HydratedDocument<IGame>,
  player: IPlayerData,
  phrase: string,
  imageURL: string,
  round: number
) {
  const message = await Message.create({
    author: player,
    gameID: game._id.toString(),
    imageURL,
    phrase,
    round,
  });
  if (!message) return null;
  game.messages.push(message);
  // Not saving the game, caller must do that
  return message;
}

export const getFinalThreads = async (game: HydratedDocument<IGame>) => {
  await game.populate({
    path: 'messages',
    populate: {
      path: 'author',
      model: 'Player',
    },
  });
  if (game.activeRound === -1) {
    const finalThreads: Stringified<IMessage>[][] = Array.from(
      new Array(game.messages.filter((m) => m.round === 1).length),
      () => []
    );

    const orderings = await Promise.all(
      // TODO: use getPreviousPlayerID helper from player service
      game.players.map((p) =>
        PlayerOrdering.findOne({
          gameID: game._id.toString(),
          current: p._id,
        }).populate('previous')
      )
    );
    const orderingMap = orderings
      .filter((o): o is HydratedDocument<IPlayerOrdering> => !!o)
      .reduce(
        (map, o) => ({
          ...map,
          [o.current.toString()]: o?.previous.current.toString(),
        }),
        {} as Record<string, string>
      );
    for (let i = 0; i < finalThreads.length; i += 1) {
      const round = i + 1;
      const messages = game.messages.filter((m) => m.round === round);
      messages.forEach((m, mIdx) => {
        const previousPlayerID = orderingMap[m.author._id.toString()];
        const thread =
          i > 0
            ? finalThreads?.find(
                (t) =>
                  t[t.length - 1].author._id.toString() === previousPlayerID &&
                  t[t.length - 1].round === round - 1
              )
            : finalThreads[mIdx];
        thread?.push(JSON.parse(JSON.stringify(m)));
      });
    }
    return finalThreads;
  }
  return null;
};

export default addMessageToGame;
