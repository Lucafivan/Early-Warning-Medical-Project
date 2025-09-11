import TopDiseasesChart from "../components/dashboard/TopDiseasesChart";
import WeatherAirQualityCard from "../components/dashboard/WeatherAirQualityCard";

const DashboardPage: React.FC = () => {
  return (
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-[1fr_1fr_1.4fr]">
          <TopDiseasesChart limit={10} height={280} />
          <WeatherAirQualityCard />
      </div>
  );
};

export default DashboardPage;