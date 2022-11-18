import clsx from 'clsx';
import { useState } from 'react';
import { BiCopy } from 'react-icons/bi';

export default function CopyURL() {
  const [copied, setCopied] = useState(false);

  const doCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
  };

  return (
    <div
      role="button"
      onClick={doCopy}
      tabIndex={0}
      onKeyUp={(e) => {
        if (['Enter', 'c', 'C'].includes(e.key)) {
          doCopy();
        }
      }}
      className="flex items-center justify-start text-l mt-2"
    >
      <BiCopy
        className={clsx('mx-1 cursor-pointer w-8 text-2xl', {
          'text-teal-400': copied,
        })}
      />
      <div
        className={clsx('absolute invis-sm', {
          'float-away': copied,
        })}
      >
        {copied ? 'Copied!' : ''}
      </div>
      <span className="hide-sm">
        Share this link with friends so they can join the fun
      </span>
      <span className="only-sm">Copy link</span>
    </div>
  );
}
