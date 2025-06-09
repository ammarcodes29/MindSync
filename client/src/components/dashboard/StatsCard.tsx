interface StatsCardProps {
  title: string;
  value: string;
  subtitle: string;
  color: "primary" | "secondary" | "accent";
}

const StatsCard = ({ title, value, subtitle, color }: StatsCardProps) => {
  const textColorClass = `text-${color}`;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm min-w-[140px]">
      <div className={`${textColorClass} font-medium mb-1 text-sm`}>{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-gray-500 dark:text-gray-400 text-xs">{subtitle}</div>
    </div>
  );
};

export default StatsCard;
