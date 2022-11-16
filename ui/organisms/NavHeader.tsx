import Link from 'next/link';
import styled from '@emotion/styled';

const NavLink = styled(Link)`
  padding: 10px;
  border-left: 1px solid white;
  margin: 4px;
  line-height: 20px;
  color: white;
`;

const Title = styled.div`
  padding: 5px;
  font-weight: 700;
  margin: 4px;
  font-size: 1.25rem;
`;

export default function NavHeader() {
  return (
    <nav className="flex bg-teal-600 text-slate-100 mb-4">
      <Title>Dall-E Phone</Title>
      <NavLink href="/">New Game</NavLink>
    </nav>
  );
}
