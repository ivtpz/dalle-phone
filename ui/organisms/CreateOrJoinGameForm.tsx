import axios, { AxiosResponse } from 'axios';
import React, { SyntheticEvent, useEffect, useState } from 'react';
import { IPlayer } from '../../db/schemas/player';
import { Stringified } from '../../db/types';
import InputField from '../molecules/InputField';

interface CreateOrJoinGameFormProps {
  onJoined: (res: AxiosResponse) => void;
  gameID?: string | null;
  player: Stringified<IPlayer> | null;
  disabled?: boolean;
}

export default function CreateOrJoinGameForm({
  onJoined,
  player,
  disabled,
  gameID = null,
}: CreateOrJoinGameFormProps) {
  const [APICreds, setAPICreds] = useState<{
    APIKey: string | null;
    orgID: string | null;
  }>({ APIKey: null, orgID: null });
  useEffect(() => {
    const APIKey = localStorage.getItem('playerAPIKey');
    const orgID = localStorage.getItem('playerOrg');
    setAPICreds({ APIKey, orgID });
  }, []);
  const joinGame = async (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    const playerName = data.get('playerName');
    const apiKey = data.get('apiKey') as string;
    const org = data.get('orgID') as string;
    if (playerName && apiKey && org) {
      localStorage.setItem('playerAPIKey', apiKey);
      localStorage.setItem('playerOrg', org);
      let status = 200;
      if (playerName !== player?.name) {
        const res = await axios.post('/api/player/create', { playerName });
        status = res.status;
      }
      if (status === 200) {
        if (gameID) {
          axios
            .patch(`/api/game/${gameID}`, { action: { type: 'JOIN_GAME' } })
            .then(onJoined);
        } else {
          axios.post('/api/game/create').then(onJoined);
        }
      }
    }
  };

  return (
    <form onSubmit={joinGame} className="mt-2">
      <div className="grid grid-col-1 gap-2 w-[450px]">
        <InputField
          fieldName="playerName"
          label="Name"
          defaultValue={player?.name}
        />
        <InputField
          fieldName="apiKey"
          label="API Key"
          defaultValue={APICreds.APIKey ?? undefined}
        />
        <InputField
          fieldName="orgID"
          label="Organization ID"
          defaultValue={APICreds.orgID ?? undefined}
        />
      </div>
      <button className="btn btn-violet" type="submit" disabled={disabled}>
        {gameID ? 'Join' : 'Create'} Game
      </button>
    </form>
  );
}
