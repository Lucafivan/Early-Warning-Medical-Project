import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import MenuProfile from "./frame/menuprofile"

function NavProfile() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Trigger */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <img
          src="https://i.pravatar.cc/40"
          alt="avatar"
          className="w-9 h-9 rounded-full object-cover"
        />
        <div className="leading-tight">
          <div className="font-semibold">SALAM PASIFIC</div>
          <div className="text-xs text-gray-500">spilindonesia@gmail.com</div>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </div>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border mr-24 ">
          <MenuProfile />
        </div>
      )}
    </div>
  );
}

export default NavProfile;
