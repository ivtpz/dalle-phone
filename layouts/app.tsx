import { ReactNode } from 'react';
import { Rubik } from '@next/font/google';
import NavHeader from '../ui/organisms/NavHeader';

const rubik = Rubik({
  weight: '400',
});

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <main className={rubik.className}>
      <NavHeader />
      <div className="m-6">{children}</div>
    </main>
  );
}
