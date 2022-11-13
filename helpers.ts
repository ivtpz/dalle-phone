import { getCookie } from 'cookies-next';
import { NextApiRequest, NextApiResponse } from 'next';
import { getById } from './service/player';

const abort = (res: NextApiResponse) => res.status(401).end('Missing player');

export async function getPlayerFromCookie(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userCookie = getCookie('user', { req, res });
  if (!userCookie || typeof userCookie !== 'string') {
    abort(res);
    return null;
  }
  const user = JSON.parse(userCookie);
  const player = getById(user?.id);
  if (!player) {
    abort(res);
    return null;
  }
  return player;
}

export default getPlayerFromCookie;
