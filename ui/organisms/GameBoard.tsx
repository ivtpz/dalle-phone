import axios from 'axios';
import { Configuration, OpenAIApi } from 'openai';
import React, { useEffect, useState } from 'react';
import { useSWRConfig } from 'swr';
import { HiOutlinePhoneArrowUpRight, HiCheckBadge } from 'react-icons/hi2';
import { BiBot } from 'react-icons/bi';
import { RequiredError } from 'openai/dist/base';
import { GameStateForPlayer } from '../../service/game';
import InputField from '../molecules/InputField';

interface GameBoardProps {
  gameState: GameStateForPlayer;
}

const waitingGifs = [
  'https://media.tenor.com/y3_vsNWz0kMAAAAC/waiting.gif',
  'https://media.tenor.com/46hKzGO154IAAAAC/waiting-impatient.gif',
  'https://media.tenor.com/zONeTx1W3zAAAAAC/waiting.gif',
];

export default function GameBoard({ gameState }: GameBoardProps) {
  const { mutate } = useSWRConfig();
  const [openapi, setOpenapi] = useState<OpenAIApi | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [badMessage, setBadMessage] = useState<false | string>(false);

  useEffect(() => {
    const config = new Configuration({
      organization: localStorage.getItem('playerOrg') ?? undefined,
      apiKey: localStorage.getItem('playerAPIKey') ?? undefined,
    });
    const openai = new OpenAIApi(config);
    setOpenapi(openai);
  }, []);

  const submitPhrase = async (e: any) => {
    setBadMessage(false);
    if (!openapi) return;
    setGeneratingImage(true);
    e.preventDefault();
    const data = new FormData(e.target);
    const phrase = data.get('phrase');
    if (phrase) {
      try {
        const result = await openapi.createImage({
          prompt: phrase as string,
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
          .then(() => {
            e.target.reset();
            mutate(`/api/game/${gameState.id}`).then(() =>
              setGeneratingImage(false)
            );
          });
      } catch (err) {
        setGeneratingImage(false);
        if ((err as RequiredError).message.includes('400')) {
          setBadMessage("Dall-E didn't like that one.");
        } else {
          setBadMessage("Hmmmm, Dall-E doesn't want to play...");
        }
      }
    }
  };

  return (
    <div className="flex justify-start ml-4 mr-4">
      <div className="w-3/4">
        {gameState.guessSubmitted && (
          <img
            className="w-1/2"
            alt="waiting"
            src={
              waitingGifs[Math.floor(Math.random() * waitingGifs.length)] ||
              waitingGifs[0]
            }
          />
        )}
        {gameState.imageToGuess && (
          <img
            className="w-96 mb-8"
            alt="Pending guess"
            src={gameState.imageToGuess}
          />
        )}
        {((gameState.activeRound === 1 && !gameState.guessSubmitted) ||
          gameState.imageToGuess) && (
          <form onSubmit={submitPhrase}>
            <InputField
              fieldName="phrase"
              label={gameState.activeRound === 1 ? 'Starting phrase' : 'Guess'}
              error={badMessage}
            />

            <button
              className="btn btn-violet"
              type="submit"
              disabled={generatingImage}
            >
              {generatingImage ? (
                <div className="flex">
                  <HiOutlinePhoneArrowUpRight className="w-7 h-6 mr-7" />{' '}
                  <div className="dot-collision mt-1.5" />
                  <BiBot className="w-7 h-6 ml-7" />
                </div>
              ) : (
                'Submit phrase'
              )}
            </button>
          </form>
        )}
      </div>
      <div className="w-1/4 ml-10">
        <h1 className="text-4xl mb-2 underline">Player Status</h1>
        {gameState.players.map((p) => (
          <div key={p._id} className="flex mb-2 text-2xl items-center">
            {p.doneWithRound ? (
              <HiCheckBadge className="w-7 h-6 mr-1 text-emerald-400" />
            ) : (
              <HiOutlinePhoneArrowUpRight className="w-7 h-6 mr-1" />
            )}
            {p.name}
          </div>
        ))}
      </div>
    </div>
  );
}
