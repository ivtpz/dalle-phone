import { BiDownArrow } from 'react-icons/bi';
import { Parallax } from 'react-scroll-parallax';
import { IMessage } from '../../db/schemas/message';
import { Stringified } from '../../db/types';

interface MessageReviewProps {
  threads: Stringified<IMessage>[][];
}

function LinePiece() {
  return (
    <Parallax
      opacity={[0, 1, 'easeInOut']}
      easing={[0.2, 0.2, 0, 1]}
      shouldAlwaysCompleteAnimation
    >
      <div className="w-[50%] h-[15px] border-r-2 border-violet-600" />
    </Parallax>
  );
}

function FadeInVerticalLine() {
  return (
    <>
      {new Array(10).fill('').map(() => (
        <LinePiece />
      ))}
    </>
  );
}

export default function MessageReview({ threads }: MessageReviewProps) {
  return (
    <div className="ml-4 grid place-items-center">
      {threads?.map((t, ti) => (
        <div className=" mt-12 mb-[200px] w-3/4" key={t[0].author._id}>
          <h1 className="text-6xl md:text-8xl border-b-2 mb-10 flex">
            <span>{t[0].author.name}&#39;s Thread</span>{' '}
            {ti === 0 && <BiDownArrow className="ml-4 bouncing" />}
          </h1>
          {t.map((m, mi) => (
            <div key={`${m._id}`}>
              <Parallax
                opacity={[0, 1]}
                easing={[0.2, 0.2, 0, 1]}
                shouldAlwaysCompleteAnimation
                className="flex justify-center w-[100%]"
              >
                <div className="border-2 border-violet-600 rounded p-2 w-[50%]">
                  <h2 className="text-4xl md:text-6xl text-center">
                    {m.phrase}
                  </h2>
                  <br />
                  <h2 className="text-xl md:text-4xl text-center">
                    - {m.author.name}
                  </h2>
                </div>
              </Parallax>
              <FadeInVerticalLine />
              <Parallax
                speed={5}
                opacity={[0, 1]}
                translateY={[0, 0]}
                easing={[0.8, 0.5, 0, 1]}
                shouldAlwaysCompleteAnimation
                className="flex justify-center"
              >
                <div className="border-2 border-violet-600 rounded p-1 w-[50%] bg-teal-600">
                  <img className="w-[100%]" src={m.imageURL} alt={m.phrase} />
                </div>
              </Parallax>
              {mi !== t.length - 1 && <FadeInVerticalLine />}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
