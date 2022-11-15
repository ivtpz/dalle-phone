import axios from 'axios';
import { Configuration, OpenAIApi } from 'openai';
import React, { useEffect, useState } from 'react';
import { GameStateForPlayer } from '../../service/game';

interface GameBoardProps {
  gameState: GameStateForPlayer;
}

export default function GameBoard({ gameState }: GameBoardProps) {
  console.log(gameState);
  const [openapi, setOpenapi] = useState(null);
  useEffect(() => {
    const config = new Configuration({
      organization: localStorage.getItem('playerOrg'),
      apiKey: localStorage.getItem('playerAPIKey'),
    });
    const openai = new OpenAIApi(config);
    setOpenapi(openai);
  }, []);
  const submitPhrase = async (e: any) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const phrase = data.get('phrase');
    const result = await openapi.createImage({
      prompt: phrase,
      n: 1,
      size: '256x256',
    });
    const { url } = result.data.data[0];
    axios
      .patch(`/api/game/${gameState.id}`, {
        action: {
          type: 'SUBMIT_MESSAGE',
          payload: {
            message: phrase,
            imageURL: url,
          },
        },
      })
      .then((r) => {
        console.log(r);
      });
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        {gameState.imageToGuess && (
          <img alt="Pending guess" src={gameState.imageToGuess} />
        )}
        {!(gameState.activeRound === 1 || gameState.imageToGuess) && (
          <form onSubmit={submitPhrase}>
            <input
              type="text"
              name="phrase"
              placeholder={
                gameState.activeRound === 1 ? 'Starting phrase' : 'Guess'
              }
            />
            <button type="submit">Submit phrase</button>
          </form>
        )}
      </div>
      <div>
        {gameState.players.filter((p) => p.doneWithRound).map((p) => p.name)}
      </div>
    </div>
  );
}
