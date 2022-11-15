import axios from 'axios';
import React from 'react';
import { IPlayer } from '../../db/schemas/player';

interface LobbyProps {
  players: IPlayer[];
}

export default function Lobby({ players, player, gameID }: LobbyProps) {
  const joinGame = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const playerName = data.get('playerName');
    const apiKey = data.get('apiKey') as string;
    const org = data.get('org') as string;
    if (playerName && apiKey) {
      localStorage.setItem('playerAPIKey', apiKey);
      localStorage.setItem('playerOrg', org);
      axios.post('/api/player/create', { playerName }).then((res) => {
        if (res.status === 200) {
          axios
            .patch(`/api/game/${gameID}`, { action: { type: 'JOIN_GAME' } })
            .then((r) => {
              console.log(r);
            });
        }
      });
    }
  };

  const startGame = () => {
    axios
      .patch(`/api/game/${gameID}`, { action: { type: 'START_GAME' } })
      .then((r) => {
        console.log(r);
      });
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        {players.map((p) => (
          <div>{p.name}</div>
        ))}
      </div>
      <div>
        {player ? (
          <button type="button" onClick={startGame}>
            Start Game
          </button>
        ) : (
          <form onSubmit={joinGame}>
            <input type="text" name="playerName" placeholder="name" />
            <input type="text" name="apiKey" placeholder="OpenAI API Key" />
            <input type="text" name="org" placeholder="OpenAI API Org ID" />
            <button type="submit">Join Game</button>
          </form>
        )}
      </div>
    </div>
  );
}
