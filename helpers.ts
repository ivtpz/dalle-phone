import { getCookie } from 'cookies-next';
import { IncomingMessage, ServerResponse } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { getById } from './service/player';

export async function getPlayerFromCookie(
  req: NextApiRequest | IncomingMessage,
  res: NextApiResponse | ServerResponse<IncomingMessage>
) {
  const userCookie = getCookie('user', { req, res });
  if (!userCookie || typeof userCookie !== 'string') {
    return null;
  }
  const user = JSON.parse(userCookie);
  const player = getById(user?.id);
  if (!player) {
    return null;
  }
  return player;
}

export default getPlayerFromCookie;
