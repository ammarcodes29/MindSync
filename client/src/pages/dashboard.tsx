import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import CourseProgress from "@/components/dashboard/CourseProgress";
import WeeklyGoals from "@/components/dashboard/WeeklyGoals";
import DailySchedule from "@/components/dashboard/DailySchedule";
import UpcomingDeadlines from "@/components/dashboard/UpcomingDeadlines";
import AnalyticsCard from "@/components/dashboard/AnalyticsCard";
import StatsCard from "@/components/dashboard/StatsCard";
import { useUser } from "@/hooks/useUser";
import { useUserStats } from "@/hooks/useUserStats";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useUser();
  const { stats, isLoading: isLoadingStats } = useUserStats();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar 
        isMobileOpen={isMobileMenuOpen} 
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />
      
      <main className="flex-1 overflow-y-auto">
        <Header 
          title="Dashboard" 
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        
        <div className="p-6">
          {/* Welcome section with quick stats */}
          <div className="mb-8">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {greeting()}, {user?.fullName?.split(' ')[0] || 'Student'}!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    You have 3 assignments due this week and 1 exam coming up.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  {isLoadingStats ? (
                    <div className="flex items-center">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <span>Loading stats...</span>
                    </div>
                  ) : stats ? (
                    <>
                      <StatsCard
                        title="Study Time"
                        value={`${stats.weeklyHoursStudied || 0} hrs`}
                        subtitle="this week"
                        color="primary"
                      />
                      
                      <StatsCard
                        title="Weekly Goal"
                        value={`${stats.weeklyStudyGoal || 10} hrs`}
                        subtitle="target"
                        color="accent"
                      />
                      
                      <StatsCard
                        title="Progress"
                        value={`${stats.overallProgress || 0}%`}
                        subtitle="overall completion"
                        color="secondary"
                      />
                    </>
                  ) : (
                    <div>No stats available</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress & goals section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <CourseProgress />
            <WeeklyGoals />
          </div>
          
          {/* Today's plan & upcoming deadlines */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <DailySchedule />
            <UpcomingDeadlines />
          </div>
          
          {/* Analytics section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoadingStats ? (
              <div className="col-span-full flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading statistics...</span>
              </div>
            ) : stats ? (
              <>
                <AnalyticsCard
                  title="Total Study Hours"
                  value={`${stats.totalHoursStudied || 0}`}
                  change={{ 
                    value: `${stats.weeklyHoursStudied || 0} this week`, 
                    positive: true 
                  }}
                  percentage={Math.min(100, ((stats.weeklyHoursStudied || 0) / (stats.weeklyStudyGoal || 10)) * 100)}
                  color="primary"
                />
                
                <AnalyticsCard
                  title="Tasks Completed"
                  value={`${stats.totalTasksCompleted || 0}`}
                  change={{ 
                    value: `${stats.streakDays || 0} day streak`, 
                    positive: (stats.streakDays || 0) > 0
                  }}
                  percentage={stats.totalTasksCompleted ? 100 : 0}
                  color="accent"
                />
                
                <AnalyticsCard
                  title="Weekly Progress"
                  value={`${stats.weeklyStudyGoal ? Math.min(100, ((stats.weeklyHoursStudied || 0) / stats.weeklyStudyGoal) * 100).toFixed(0) : 0}%`}
                  change={{ 
                    value: `${stats.weeklyStudyGoal || 10} hr goal`, 
                    positive: ((stats.weeklyHoursStudied || 0) / (stats.weeklyStudyGoal || 10)) >= 0.5
                  }}
                  percentage={Math.min(100, ((stats.weeklyHoursStudied || 0) / (stats.weeklyStudyGoal || 10)) * 100)}
                  color="secondary"
                />
                
                <AnalyticsCard
                  title="Overall Progress"
                  value={`${stats.overallProgress || 0}%`}
                  change={{ 
                    value: `${(stats.improvement || 0) > 0 ? '+' : ''}${stats.improvement || 0}% improvement`, 
                    positive: (stats.improvement || 0) >= 0
                  }}
                  percentage={Number(stats.overallProgress || 0)}
                  color="green-500"
                />
              </>
            ) : (
              <div className="col-span-full text-center py-8">
                <p>No statistics available. Start studying to generate data!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
