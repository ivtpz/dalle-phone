import { NextPageContext } from 'next';
import React from 'react';
import { IPlayer } from '../../db/schemas/player';
import { getPlayerFromCookie } from '../../helpers';
import {
  GameStateForPlayer,
  gameStateForPlayer,
  getById,
  handleAction,
} from '../../service/game';
import GameBoard from '../../ui/organisms/GameBoard';
import Lobby from '../../ui/organisms/Lobby';

export async function getServerSideProps(context: NextPageContext) {
  const gameId = context.query.id as string;

  const game = await getById(gameId);

  if (!game) {
    return {
      redirect: {
        destination: '/',
        statusCode: 302,
      },
    };
  }

  await game?.populate('players');

  const player = await getPlayerFromCookie(context.req, context.res);
  if (!player) {
    return { props: { player: null, game: JSON.parse(JSON.stringify(game)) } };
  }

  const hasJoined =
    player &&
    !!game?.players.find((p) => p._id.toString() === player._id.toString());

  if (!hasJoined) {
    await handleAction({ type: 'JOIN_GAME' }, game, player);
  }

  return {
    props: {
      game: await gameStateForPlayer(player, game),
      player: JSON.parse(JSON.stringify(player)),
    },
  };
}

interface PlayGameProps {
  game: GameStateForPlayer;
  player: IPlayer | null;
}

export default function PlayGame({ game, player }: PlayGameProps) {
  if (game.activeRound === 0) {
    return <Lobby players={game.players} player={player} gameID={game.id} />;
  }
  if (game.activeRound === -1) {
    return <div>TODO: show the results</div>;
  }
  return <GameBoard gameState={game} />;
}
