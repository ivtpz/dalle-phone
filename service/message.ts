import { HydratedDocument } from 'mongoose';
import { IGame } from '../db/schemas/game';
import { IMessage, Message } from '../db/schemas/message';
import { IPlayer } from '../db/schemas/player';
import { PlayerOrdering } from '../db/schemas/playerOrdering';

/**
 * Creates a message record and adds it to the game's messages.
 *
 * NOTE: Caller must save the game
 */
export async function addMessageToGame(
  game: HydratedDocument<IGame>,
  player: HydratedDocument<IPlayer>,
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
  if (game.activeRound === -1) {
    const finalThreads: IMessage[][] = new Array(
      game.messages.filter((m) => m.round === 1).length
    )
      .fill(1)
      .map((_) => []);

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
      .filter((o) => !!o)
      .reduce(
        (map, o) => ({
          ...map,
          [o.current]: o?.previous.current.toString(),
        }),
        {}
      );
    for (let i = 0; i < finalThreads.length; i++) {
      const round = i + 1;
      const messages = game.messages.filter((m) => m.round === round);
      messages.forEach((m, mIdx) => {
        const previousPlayerID = orderingMap[m.author];
        const thread =
          i > 0
            ? finalThreads?.find(
                (t) =>
                  t[t.length - 1].author.toString() === previousPlayerID &&
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
