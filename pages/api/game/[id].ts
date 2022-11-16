import type { NextApiRequest, NextApiResponse } from 'next';
import { getPlayerFromCookie } from '../../../helpers';
import {
  Action,
  gameStateForPlayer,
  getById,
  handleAction,
  Status,
} from '../../../service/game';
import connect from '../../../db/connection';

type Data = {
  id: string;
};

// TODO: test it
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await connect();
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).end('Missing or invalid game ID');
  }
  const player = await getPlayerFromCookie(req, res);
  if (player) {
    // TODO: limit to players in the game
    const foundGame = await getById(id);
    if (!foundGame) {
      return res.status(404).end('Could not find game');
    }
    switch (req.method) {
      case 'GET':
        return res
          .status(200)
          .json(await gameStateForPlayer(foundGame, player));

      case 'PATCH':
        const { action } = req.body as { action: Action };
        const update = await handleAction(action, foundGame, player);
        if (update.status === Status.UPDATED) {
          return res
            .status(200)
            .json(await gameStateForPlayer(update.game, player));
        }
        return res.status(400).end(`Failed to update game. ${update.reason}`);

      default:
        res.setHeader('Allow', ['PATCH', 'GET']);
        return res.status(405).end(`Method ${req.method} not allowed`);
    }
  }
  return res.status(401).end('Could not find player');
}
