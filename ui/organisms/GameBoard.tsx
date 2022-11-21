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
  freeloader?: boolean;
}

const waitingGifs = [
  'https://media.tenor.com/y3_vsNWz0kMAAAAC/waiting.gif',
  'https://media.tenor.com/46hKzGO154IAAAAC/waiting-impatient.gif',
  'https://media.tenor.com/zONeTx1W3zAAAAAC/waiting.gif',
];

export default function GameBoard({ gameState, freeloader }: GameBoardProps) {
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
        const url = freeloader
          ? (await axios({ url: '/api/dall-e', params: { search: phrase } }))
              .data.imageURL
          : (
              await openapi.createImage({
                prompt: phrase as string,
                n: 1,
                size: '256x256',
              })
            ).data.data[0].url;
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
          })
          .catch(() => {
            setBadMessage("Whoops couldn't save that message");
            setGeneratingImage(false);
          });
      } catch (err) {
        setGeneratingImage(false);
        if ((err as RequiredError).message.includes('400')) {
          setBadMessage("Dall·E didn't like that one.");
        } else {
          setBadMessage("Hmmmm, Dall·E doesn't want to play...");
        }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="glow-border h-[60vh] lg:h-[80vh] lg:col-span-8 flex flex-col-reverse justify-between items-center">
        {((gameState.activeRound === 1 && !gameState.guessSubmitted) ||
          gameState.imageToGuess) && (
          <form onSubmit={submitPhrase} className="mr-4 w-full p-4">
            <InputField
              fieldName="phrase"
              label={gameState.activeRound === 1 ? 'Starting phrase' : 'Guess'}
              error={badMessage}
              required
            />
            <div className="flex justify-end">
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
            </div>
          </form>
        )}
        {gameState.guessSubmitted && (
          <img
            className="h-full"
            alt="waiting"
            src={
              waitingGifs[Math.floor(Math.random() * waitingGifs.length)] ||
              waitingGifs[0]
            }
          />
        )}
        {gameState.imageToGuess && (
          <img
            className="h-full mb-8"
            alt="Pending guess"
            src={gameState.imageToGuess}
          />
        )}
      </div>
      <div className="lg:col-span-4 flex justify-center">
        <div className="glow-border w-full h-fit">
          <h1 className="text-4xl p-2 underline hide-sm">Player Status</h1>
          {gameState.players.map((p) => (
            <div
              key={p._id}
              className="flex m-1 text-2xl items-center glow-border-i"
            >
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
    </div>
  );
}
