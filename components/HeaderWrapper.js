import { useRouter } from 'next/router'
import { useState, createContext, useContext } from 'react'
import MainHeader from './MainHeader'
import ClinicHeader from './clinic/ClinicHeader'
import RealEstateHeader from './real-estate/RealEstateHeader'

// Create context for menu state
const MenuContext = createContext()

export const useMenuContext = () => useContext(MenuContext)

// Create a provider component that wraps the entire app
export function MenuProvider({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  return (
    <MenuContext.Provider value={{ isMenuOpen, setIsMenuOpen }}>
      {children}
    </MenuContext.Provider>
  )
}

export default function HeaderWrapper() {
  const router = useRouter()
  const { isMenuOpen, setIsMenuOpen } = useMenuContext()

  // Show clinic header for clinic pages
  if (router.pathname.startsWith('/product/clinic')) {
    return <ClinicHeader isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
  }

  // Show real estate header for real estate pages
  if (router.pathname.startsWith('/product/real-estate')) {
    return <RealEstateHeader isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
  }

  // Show main header for all other pages
  return <MainHeader />
}
