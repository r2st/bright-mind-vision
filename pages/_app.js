import '@styles/globals.css'
import { MenuProvider } from '@components/ClientHeaderWrapper'
import dynamic from 'next/dynamic'
import Head from 'next/head'

// Dynamic import for client-side HeaderWrapper
const HeaderWrapper = dynamic(() => import('@components/ClientHeaderWrapper'), {
  ssr: false
})

function Application({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* Viewport meta tag for proper mobile rendering */}
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
      </Head>
      <MenuProvider>
        <HeaderWrapper />
        <Component {...pageProps} />
      </MenuProvider>
    </>
  )
}

export default Application
