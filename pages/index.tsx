import { getCookie } from 'cookies-next';
import React from 'react';
import type { NextPageContext } from 'next/types';
import { AxiosResponse } from 'axios';
import { IPlayer } from '../db/schemas/player';
import styles from '../styles/Home.module.css';
import CreateGameForm from '../ui/organisms/CreateOrJoinGameForm';
import { Stringified } from '../db/types';
import connect from '../db/connection';

export async function getServerSideProps(context: NextPageContext) {
  await connect();
  const cookie = getCookie('user', { req: context.req, res: context.res });
  return {
    props: {
      player: cookie && typeof cookie === 'string' ? JSON.parse(cookie) : null,
    },
  };
}

interface HomeProps {
  player: Stringified<IPlayer>;
}

export default function Home({ player }: HomeProps) {
  const onCreated = (r: AxiosResponse) => {
    if (r.status === 200) {
      window.location.href = `${window.location.origin}/play/${r.data._id}`;
    }
  };
  return (
    <div className={styles.container}>
      <CreateGameForm onJoined={onCreated} player={player} />
    </div>
  );
}
