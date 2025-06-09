import ProgressCircle from "./ProgressCircle";

interface AnalyticsCardProps {
  title: string;
  value: string;
  change: {
    value: string;
    positive: boolean;
  };
  percentage: number;
  color: string;
}

const AnalyticsCard = ({ title, value, change, percentage, color }: AnalyticsCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm flex items-center">
      <div className="flex-1">
        <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</h3>
        <div className="text-2xl font-semibold">{value}</div>
        <div className={`flex items-center text-xs ${change.positive ? 'text-green-500' : 'text-amber-500'} mt-1`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={change.positive ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"}
            />
          </svg>
          <span>{change.value}</span>
        </div>
      </div>
      <ProgressCircle 
        value={percentage} 
        className={`text-${color}`} 
      />
    </div>
  );
};

export default AnalyticsCard;
