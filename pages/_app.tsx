import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { SWRConfig } from 'swr';
import { ParallaxProvider } from 'react-scroll-parallax';

import Layout from '../layouts/app';

export default function App({ Component, pageProps }: AppProps) {
  const { fallback, ...rest } = pageProps;
  return (
    <Layout>
      <ParallaxProvider>
        <SWRConfig value={fallback ? { fallback } : {}}>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <Component {...rest} />
        </SWRConfig>
      </ParallaxProvider>
    </Layout>
  );
}
