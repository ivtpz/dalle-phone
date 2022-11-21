import { ReactNode } from 'react';
import NavHeader from '../ui/organisms/NavHeader';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <main>
      <NavHeader />
      <div className="m-6">{children}</div>
    </main>
  );
}
