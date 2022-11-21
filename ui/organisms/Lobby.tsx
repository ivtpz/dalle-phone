import axios, { AxiosResponse } from 'axios';
import clsx from 'clsx';
import React, { useState } from 'react';
import { useSWRConfig } from 'swr';
import { IPlayer } from '../../db/schemas/player';
import { Stringified } from '../../db/types';
import { IPlayerData } from '../../service/player';
import CopyURL from '../molecules/CopyURL';
import CreateOrJoinGameForm from './CreateOrJoinGameForm';

interface LobbyProps {
  players: Stringified<IPlayer>[];
  player: IPlayerData | null;
  gameID: string;
  hasJoined?: boolean;
}

export default function Lobby({
  players,
  player,
  gameID,
  hasJoined,
}: LobbyProps) {
  const { mutate } = useSWRConfig();
  const [loading, setLoading] = useState(false);

  const onJoined = (res: AxiosResponse) => {
    // TODO: this loading state isn't right - need to set it inside the create / join form
    setLoading(true);
    if (res.status === 200) {
      mutate(`/api/game/${gameID}`).then(() => setLoading(false));
    }
  };

  const startGame = () => {
    setLoading(true);
    axios
      .patch(`/api/game/${gameID}`, { action: { type: 'START_GAME' } })
      .then(() => {
        mutate(`/api/game/${gameID}`).then(() => setLoading(false));
      });
  };

  return (
    <div className={clsx('flex flex-col items-center gap-4')}>
      <div>
        {!hasJoined && (
          <div className="mb-4">
            <CreateOrJoinGameForm
              onJoined={onJoined}
              gameID={gameID}
              player={player}
              disabled={loading}
            />
          </div>
        )}
        <div className="glow-border">
          <div className="mb-4">
            <h1 className="text-4xl underline">Players</h1>
          </div>
          {players.map((p) => (
            <div className="text-2xl glow-border-i p-2 mb-1" key={p._id}>
              {p.name}
            </div>
          ))}
          {hasJoined && (
            <div className="flex items-center place-content-between sm:justify-end gap-2">
              <CopyURL />
              <button
                className="btn btn-violet mt-4 whitespace-nowrap"
                type="button"
                onClick={startGame}
                disabled={loading}
              >
                Start Game
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
