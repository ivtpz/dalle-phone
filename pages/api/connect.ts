import type { NextApiRequest, NextApiResponse } from 'next';
import connect from '../../db/connection';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connect();
  return res.status(200).send('Connected');
}
