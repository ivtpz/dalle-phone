import axios, { AxiosResponse } from 'axios';
import React, { SyntheticEvent, useEffect, useState } from 'react';
import { BiInfoCircle } from 'react-icons/bi';
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
    <form onSubmit={joinGame} className="mt-2 w-[470px]">
      <div className="grid grid-col-1 gap-2 w-[470px]">
        <InputField
          fieldName="playerName"
          label="Name"
          defaultValue={player?.name}
        />
        <InputField
          type="password"
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
      <div className="mb-2 flex items-center space-x-1">
        <BiInfoCircle className="mr-1 w-8" />
        <div>
          Get an OpenAI API key{' '}
          <a href="https://beta.openai.com/account/api-keys" target="blank">
            here
          </a>
          . It&#39;s kept in your browser&#39;s local storage, and only sent to
          the Dall-E API.
        </div>
      </div>
      <button
        className="btn btn-violet float-right"
        type="submit"
        disabled={disabled}
      >
        {gameID ? 'Join' : 'Create'} Game
      </button>
    </form>
  );
}
