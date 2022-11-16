// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { setCookie } from 'cookies-next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { create } from '../../../service/player';
import type { PlayerData } from '../../../service/player';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PlayerData>
) {
  const { method, body } = req;
  const { playerName } = body;
  if (!playerName) {
    return res.status(400).end('Missing player name');
  }
  switch (method) {
    case 'POST':
      const player = await create(playerName);
      if (player) {
        setCookie('user', JSON.stringify(player), { req, res });
        return res.status(200).json(player);
      }
      return res.status(500).end('Could not create player');
    default:
      res.setHeader('Allow', ['POST']);
      return res.status(405).end(`Method ${method} not allowed`);
  }
}