import { NextRequest, NextResponse } from 'next/server';
import nextConnect from 'next-connect';
import type { NextHandler } from 'next-connect';
import connect from '../db/connection';

async function database(
  req: NextRequest,
  res: NextResponse,
  next: NextHandler
) {
  await connect();
  return next();
}

const middleware = nextConnect();
middleware.use(database);

export default middleware;
