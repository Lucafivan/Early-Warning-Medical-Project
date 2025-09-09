const EarlyWarningPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gray-200 h-14" />
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-[1fr_1fr_1.4fr]">
        <div className="rounded-xl bg-gray-200 h-52" />
        <div className="rounded-xl bg-gray-200 h-52" />
        <div className="rounded-xl bg-gray-200 h-80" />
      </div>
      <div className="rounded-xl bg-gray-200 h-40" />
      <div className="rounded-xl bg-gray-200 h-96" />
    </div>
  );
};

export default EarlyWarningPage;