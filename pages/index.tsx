import { getCookie } from 'cookies-next';
import React from 'react';
import type { NextPageContext } from 'next/types';
import axios from 'axios';
import { IPlayer } from '../db/schemas/player';
import styles from '../styles/Home.module.css';

export async function getServerSideProps(context: NextPageContext) {
  return {
    props: {
      player: getCookie('user', { req: context.req, res: context.res }) || null,
    },
  };
}

interface HomeProps {
  player: IPlayer;
}

export default function Home({ player }: HomeProps) {
  // TODO: what if there's already a player cookie?
  const startGame = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const playerName = data.get('playerName');
    axios.post('/api/player/create', { playerName }).then((res) => {
      if (res.status === 200) {
        axios.post('/api/game/create').then((r) => {
          if (r.status === 200) {
            window.location.href = `${window.location.origin}/play/${r.data._id}`;
          }
        });
      }
    });
  };
  return (
    <div className={styles.container}>
      <form onSubmit={startGame}>
        <input type="text" name="playerName" placeholder="name" />
        <button type="submit">Start Game</button>
      </form>
    </div>
  );
}
