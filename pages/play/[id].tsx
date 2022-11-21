import { NextPageContext } from 'next';
import { useRouter } from 'next/router';
import React from 'react';
import useSWR from 'swr';
import connect from '../../db/connection';
import fetcher from '../../data/fetcher';
import { getPlayerFromCookie } from '../../helpers';
import {
  GameStateForPlayer,
  gameStateForPlayer,
  getById,
} from '../../service/game';
import GameBoard from '../../ui/organisms/GameBoard';
import Lobby from '../../ui/organisms/Lobby';
import MessageReview from '../../ui/organisms/MessageReview';
import { IPlayerData } from '../../service/player';

export async function getServerSideProps(context: NextPageContext) {
  await connect();
  const gameId = context.query.id as string;

  const dbGame = await getById(gameId);

  if (!dbGame) {
    return {
      redirect: {
        destination: '/',
        statusCode: 302,
      },
    };
  }

  if (!context.req || !context.res) {
    return {
      props: {},
    };
  }

  const player = await getPlayerFromCookie(context.req, context.res);
  const game = await gameStateForPlayer(dbGame, player);
  return {
    props: {
      player: player ? JSON.parse(JSON.stringify(player)) : null,
      fallback: {
        [`/api/game/${gameId}`]: game,
      },
    },
  };
}

interface PlayGameProps {
  player: IPlayerData | null;
}

export default function PlayGame({ player }: PlayGameProps) {
  const {
    query: { id },
  } = useRouter();
  const { data } = useSWR<GameStateForPlayer>(`/api/game/${id}`, fetcher, {
    refreshInterval: 1000,
  });

  if (!data) {
    return null;
  }

  if (data.activeRound === 0) {
    return (
      <Lobby
        players={data.players}
        player={player}
        gameID={data.id}
        hasJoined={data.hasJoined}
      />
    );
  }
  if (data.activeRound === -1) {
    return <MessageReview threads={data.finalThreads ?? [[]]} />;
  }
  return (
    <GameBoard
      gameState={data as GameStateForPlayer}
      freeloader={player?.freeloader}
    />
  );
}
