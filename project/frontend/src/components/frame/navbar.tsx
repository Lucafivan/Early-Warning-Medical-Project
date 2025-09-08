import React from 'react'
import spilLogo from "../../assets/spil_logo.png";
import Navprofile from '../navprofile';

function Navbar() {
  return (
    
    <header className="h-16 bg-gray-50 border-b border-gray-200 px-4 flex items-center justify-between">
        {/* Logo kiri */}
        <div className="flex items-center h-full">
          <img src={spilLogo} alt="SPIL Logo" className="h-10 object-contain ml-5" />
        </div>

        {/* User info kanan */}
        <Navprofile />
      </header>
  )
}

export default Navbar