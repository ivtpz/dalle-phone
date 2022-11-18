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
      {new Array(10).fill('').map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <LinePiece key={i} />
      ))}
    </>
  );
}

export default function MessageReview({ threads }: MessageReviewProps) {
  return (
    <div className="grid place-items-center">
      {threads?.map((t) => (
        <div
          className="mb-[200px] sm:w-3/4 glow-border-i"
          key={t[0].author._id}
        >
          <div className="flex justify-center">
            <h1 className="text-6xl md:text-8xl mb-10 flex items-center">
              <span>{t[0].author.name}&#39;s Thread</span>{' '}
              <BiDownArrow className="ml-4 text-4xl md:text-6xl bouncing" />
            </h1>
          </div>
          {t.map((m, mi) => (
            <div key={`${m._id}`}>
              <Parallax
                opacity={[0, 1]}
                easing={[0.2, 0.2, 0, 1]}
                shouldAlwaysCompleteAnimation
                className="flex justify-center w-[100%]"
              >
                <div className="glow-border sm:w-[50%]">
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
                <div className="glow-border sm:w-[50%]">
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
