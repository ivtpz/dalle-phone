/* eslint-disable no-param-reassign */
import { HydratedDocument } from 'mongoose';
import { Game, IGame } from '../db/schemas/game';
import { IPlayer } from '../db/schemas/player';
import { createPlayerOrdering } from './player';
import { addMessageToGame } from './message';

export async function create(player: IPlayer) {
  const game = await Game.create({
    createdBy: player,
    players: [player],
  });
  if (!game) return null;
  return game;
}

export async function getById(
  id: string
): Promise<HydratedDocument<IGame> | null> {
  const game = await Game.findById(id);
  if (!game) return null;
  return game;
}

async function isRoundComplete(game: HydratedDocument<IGame>) {
  // Not checking for one message per player as that is enforced with a uniqueness constraint
  await game.populate('messages');
  const numMessagesInRound = game.messages.filter(
    (m) => m.round === game.activeRound
  ).length;
  const numPlayers = game.players.length;
  return numMessagesInRound >= numPlayers;
}

/**
 * NOTE: Caller must save the game!
 */
function moveToNextRound(game: HydratedDocument<IGame>) {
  game.activeRound += 1;
  if (game.activeRound > game.players.length) {
    game.activeRound = -1;
  }
  return game;
}

interface JoinGameAction {
  type: 'JOIN_GAME';
}

interface StartGameAction {
  type: 'START_GAME';
}

interface SubmitMessageAction {
  type: 'SUBMIT_MESSAGE';
  payload: {
    message: string;
    imageURL: string;
  };
}

export type Action = JoinGameAction | StartGameAction | SubmitMessageAction;

export enum Reasons {
  UNKNOWN_ACTION = 'Unrecognized action',
  INVALID_ACTION_FOR_STATE = 'Cannot perform action in current game state',
  ALREADY_JOINED = 'Player has already joined game',
  NOT_ALLOWED_FOR_PLAYER = 'Player is not allowed to take this action',
  INVALID_MESSAGE = "Player's message could not be saved",
}

export enum Status {
  NOT_UPDATED = 0,
  UPDATED = 1,
}

export type Result =
  | {
      status: Status.UPDATED;
      game: HydratedDocument<IGame>;
    }
  | {
      status: Status.NOT_UPDATED;
      reason: Reasons;
    };

export async function handleAction(
  action: Action,
  game: HydratedDocument<IGame>,
  player: HydratedDocument<IPlayer>
): Promise<Result> {
  // TODO: Ensure one game action is processed per game at a time
  switch (action.type) {
    case 'JOIN_GAME':
      if (game.activeRound === 0) {
        if (
          !game.players.find((p) => p?.toString() === player._id.toString())
        ) {
          game.players.push(player);
          await game.save();
          return {
            status: Status.UPDATED,
            game,
          };
        }
        return {
          status: Status.NOT_UPDATED,
          reason: Reasons.ALREADY_JOINED,
        };
      }
      return {
        status: Status.NOT_UPDATED,
        reason: Reasons.INVALID_ACTION_FOR_STATE,
      };

    case 'START_GAME':
      if (game.activeRound === 0) {
        if (game.createdBy.toString() !== player._id.toString()) {
          return {
            status: Status.NOT_UPDATED,
            reason: Reasons.NOT_ALLOWED_FOR_PLAYER,
          };
        }
        const po = await createPlayerOrdering(game);
        [game.playerOrdering] = po;
        game.activeRound = 1;
        await game.save();
        return {
          status: Status.UPDATED,
          game,
        };
      }
      return {
        status: Status.NOT_UPDATED,
        reason: Reasons.INVALID_ACTION_FOR_STATE,
      };

    case 'SUBMIT_MESSAGE':
      if (game.activeRound > 0 && game.activeRound <= game.players.length) {
        try {
          await addMessageToGame(
            game,
            player,
            action.payload.message,
            action.payload.imageURL,
            game.activeRound
          );
        } catch (e) {
          return {
            status: Status.NOT_UPDATED,
            reason: Reasons.INVALID_MESSAGE,
          };
        }
        const isComplete = await isRoundComplete(game);
        if (isComplete) {
          moveToNextRound(game);
        }
        await game.save();
        return {
          status: Status.UPDATED,
          game,
        };
      }
      return {
        status: Status.NOT_UPDATED,
        reason: Reasons.INVALID_ACTION_FOR_STATE,
      };

    default:
      return {
        status: Status.NOT_UPDATED,
        reason: Reasons.UNKNOWN_ACTION,
      };
  }
}
