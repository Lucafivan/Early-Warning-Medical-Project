import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import TopDiseasesChart from "../components/dashboard/TopDiseasesChart";
import WeatherAirQualityCard from "../components/dashboard/WeatherAirQualityCard";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface DecodedToken {
  sub: string; // email/identifier user dari token
}

const DashboardPage: React.FC = () => {
  const [displayName, setDisplayName] = useState<string>("User");

  useEffect(() => {
    const loadName = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const decoded = jwtDecode<DecodedToken>(token);
        const userEmail = decoded?.sub;
        if (!userEmail) return;

        const res = await axios.get<User[]>("http://localhost:5000/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const current = res.data.find((u) => u.email === userEmail);
        if (current?.username) setDisplayName(current.username);
        else if (current?.email) setDisplayName(current.email.split("@")[0]);
      } catch {
        // biarkan fallback "User"
      }
    };

    loadName();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl sm:text-3xl font-bold max-w-2xl">
        Hello, {displayName}
      </h1>

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-[1fr_1fr_1.4fr]">
        <TopDiseasesChart limit={10} height={280} />
        <WeatherAirQualityCard />
      </div>
    </div>
  );
};

export default DashboardPage;