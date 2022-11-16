import { ReactNode } from 'react';
import NavHeader from '../ui/organisms/NavHeader';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <main>
      <NavHeader />
      {children}
    </main>
  );
}
