import type { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, OpenAIApi } from 'openai';
import connect from '../../db/connection';
import { getPlayerFromCookie } from '../../helpers';

type Data =
  | {
      imageURL: string;
    }
  | {
      message: string;
    };

const API_KEY = process.env.DALLE_API_KEY;
const ORG_ID = process.env.DALEE_ORG;
const config = new Configuration({ organization: ORG_ID, apiKey: API_KEY });
const openai = new OpenAIApi(config);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await connect();
  const player = await getPlayerFromCookie(req, res);
  if (!player?.freeloader) {
    return res.status(401).end('No can do, buckaroo');
  }
  switch (req.method) {
    case 'GET':
      const { search } = req.query;
      const result = await openai.createImage({
        prompt: search,
        n: 1,
        size: '256x256',
      });
      const { url } = result.data.data[0];
      if (url) {
        return res.status(200).json({ imageURL: url });
      }
      return res.status(404).send({ message: 'No image found' });

    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} not allowed`);
  }
}
