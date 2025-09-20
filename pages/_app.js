import '@styles/globals.css'
import { MenuProvider } from '@components/HeaderWrapper'
import HeaderWrapper from '@components/HeaderWrapper'

function Application({ Component, pageProps }) {
  return (
    <MenuProvider>
      <HeaderWrapper />
      <Component {...pageProps} />
    </MenuProvider>
  )
}

export default Application
