import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import MenuProfile from "./frame/menuprofile";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; 

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface DecodedToken {
  sub: string; // 'sub' biasanya berisi identifier user (email/username)
  // tambahkan properti lain dari token jika ada
}

function NavProfile() {
  const [open, setOpen] = useState(false);
 
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          console.error("Token tidak ditemukan. User belum login.");
          return;
        }

        const decodedToken = jwtDecode<DecodedToken>(token);
        const userEmail = decodedToken.sub; // 'sub' adalah subject dari token, yaitu email user

        const response = await axios.get("http://localhost:5000/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const allUsers: User[] = response.data;
        const currentUser = allUsers.find(u => u.email === userEmail);

        if (currentUser) {
          setUser(currentUser);
        } else {
          console.error("User yang sedang login tidak ditemukan di daftar.");
        }

      } catch (error) {
        console.error("Gagal mengambil data user:", error);
        // Mungkin token sudah expired atau API error
      }
    };

    fetchUserProfile();
  }, []); // Array kosong berarti useEffect hanya berjalan sekali saat komponen dimuat

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
          {/* 6. Tampilkan data dari state, beri fallback "Loading..." */}
          <div className="font-semibold">
            {user ? user.username : "Loading..."}
          </div>
          <div className="text-xs text-gray-500">
            {user ? user.email : ""}
          </div>
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