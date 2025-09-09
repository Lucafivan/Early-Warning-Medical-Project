import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; 

const DefaultAvatar = () => (
  <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-6 h-6 text-gray-400"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  </div>
);

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
      <div className="flex items-center gap-3">
        <DefaultAvatar />
        <div className="leading-tight">
          {/* 6. Tampilkan data dari state, beri fallback "Loading..." */}
          <div className="font-semibold">
            {user ? user.username : "Loading..."}
          </div>
          <div className="text-xs text-gray-500">
            {user ? user.email : ""}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NavProfile;