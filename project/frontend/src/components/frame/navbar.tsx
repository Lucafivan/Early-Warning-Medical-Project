import React from 'react'
import spilLogo from "../../assets/spil_logo.png";

function Navbar() {
  return (
    
    <header className="h-16 bg-gray-50 border-b border-gray-200 px-4 flex items-center justify-between">
        {/* Logo kiri */}
        <div className="flex items-center h-full">
          <img src={spilLogo} alt="SPIL Logo" className="h-10 object-contain ml-5" />
        </div>

        {/* User info kanan */}
        <div className="flex items-center gap-3">
          <img src="https://i.pravatar.cc/40" alt="avatar" className="w-9 h-9 rounded-full object-cover" />
          <div className="leading-tight">
            <div className="font-semibold">Salam Pacific Indonesia Lines</div>
            <div className="text-xs text-gray-500">spilsalampacificindonesialines@gmail.com</div>
          </div>
          <span className="text-gray-500">▾</span>
        </div>
      </header>
  )
}

export default Navbar