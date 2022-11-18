import { Rubik_Glitch } from '@next/font/google';
import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/router';

const rubikGlitch = Rubik_Glitch({
  weight: '400',
});

export default function NavHeader() {
  const { pathname } = useRouter();
  return (
    <nav className="grid grid-cols-12 bg-teal-600 text-slate-100 mb-4">
      <div className="col-span-2 lg:col-span-1" />
      <div
        className={clsx(
          'm-2 p-1 text-2xl sm:text-3xl md:text-5xl col-span-8 lg:col-span-10 text-center',
          rubikGlitch.className
        )}
      >
        Dall·E Phone
      </div>
      <div className="col-span-2 lg:col-span-1 flex items-center justify-center">
        {pathname !== '/' && (
          <Link
            href="/"
            className="text-l md:text-xl text-slate-100 whitespace-nowrap"
          >
            New Game
          </Link>
        )}
      </div>
    </nav>
  );
}
