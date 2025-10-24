import '@styles/globals.css'
import { MenuProvider } from '@components/ClientHeaderWrapper'
import dynamic from 'next/dynamic'

// Dynamic import for client-side HeaderWrapper
const HeaderWrapper = dynamic(() => import('@components/ClientHeaderWrapper'), {
  ssr: false
})

function Application({ Component, pageProps }) {
  return (
    <MenuProvider>
      <HeaderWrapper />
      <Component {...pageProps} />
    </MenuProvider>
  )
}

export default Application
