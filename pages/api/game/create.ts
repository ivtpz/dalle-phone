import type { NextApiRequest, NextApiResponse } from 'next';
import { getPlayerFromCookie } from '../../../helpers';
import { create } from '../../../service/game';
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
  const player = await getPlayerFromCookie(req, res);
  if (player) {
    switch (req.method) {
      case 'POST':
        const game = await create(player);
        if (game) {
          return res.status(200).json(game.toJSON());
        }
        return res.status(500).end('Could not create game');
      default:
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} not allowed`);
    }
  }
  return res.status(401).end('Missing player');
}
