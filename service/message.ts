import { HydratedDocument } from 'mongoose';
import { IGame } from '../db/schemas/game';
import { Message } from '../db/schemas/message';
import { IPlayer } from '../db/schemas/player';

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

export default addMessageToGame;
