import axios, { AxiosResponse } from 'axios';
import React, { useState } from 'react';
import { useSWRConfig } from 'swr';
import { IPlayer } from '../../db/schemas/player';
import { Stringified } from '../../db/types';
import CreateOrJoinGameForm from './CreateOrJoinGameForm';

interface LobbyProps {
  players: Stringified<IPlayer>[];
  player: Stringified<IPlayer> | null;
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
    <div className="grid grid-cols-2 gap-4 m-4">
      <div>
        <div className="mb-2 border-b-2">
          <h1 className="text-4xl">Players</h1>
        </div>
        {players.map((p) => (
          <div className="text-2xl" key={p._id}>
            {p.name}
          </div>
        ))}
        {hasJoined && (
          <button
            className="btn btn-violet mt-4 float-right"
            type="button"
            onClick={startGame}
            disabled={loading}
          >
            Start Game
          </button>
        )}
      </div>
      <div>
        {!hasJoined && (
          <CreateOrJoinGameForm
            onJoined={onJoined}
            gameID={gameID}
            player={player}
            disabled={loading}
          />
        )}
      </div>
    </div>
  );
}
