import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, addDays } from "date-fns";
import { StudySession } from "@shared/schema";

const DailySchedule = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  const formattedDate = format(currentDate, "MMM dd");
  
  const { data: sessions, isLoading } = useQuery({
    queryKey: ["/api/study-sessions", { date: currentDate.toISOString() }],
    enabled: true,
  });

  const goToPreviousDay = () => {
    setCurrentDate(subDays(currentDate, 1));
  };

  const goToNextDay = () => {
    setCurrentDate(addDays(currentDate, 1));
  };

  // Example schedule data for initial render
  const defaultSessions: StudySession[] = [
    {
      id: 1,
      userId: 1,
      title: "Computer Science Lecture",
      startTime: new Date(new Date().setHours(9, 0, 0, 0)),
      endTime: new Date(new Date().setHours(10, 30, 0, 0)),
      location: "Building 3, Room 201",
      completed: false
    } as StudySession,
    {
      id: 2,
      userId: 1,
      title: "Study Session: Mathematics",
      startTime: new Date(new Date().setHours(11, 0, 0, 0)),
      endTime: new Date(new Date().setHours(12, 30, 0, 0)),
      location: "Library, Study Room 4",
      completed: false
    } as StudySession,
    {
      id: 3,
      userId: 1,
      title: "History Seminar",
      startTime: new Date(new Date().setHours(14, 0, 0, 0)),
      endTime: new Date(new Date().setHours(15, 30, 0, 0)),
      location: "Humanities Building, Room 105",
      completed: false
    } as StudySession,
    {
      id: 4,
      userId: 1,
      title: "Study Session: CS Project",
      startTime: new Date(new Date().setHours(16, 30, 0, 0)),
      endTime: new Date(new Date().setHours(18, 0, 0, 0)),
      location: "Student Center",
      completed: false
    } as StudySession
  ];

  const displaySessions = sessions || defaultSessions;
  
  // Sort sessions by start time
  const sortedSessions = [...displaySessions].sort((a, b) => {
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });

  // Color map for different types of sessions
  const sessionColors: Record<string, string> = {
    "Computer Science": "bg-primary/10",
    "Mathematics": "bg-accent/10",
    "History": "bg-secondary/10",
    "Study Session": "bg-primary/10",
    "default": "bg-primary/10"
  };

  // Get background color based on session title
  const getSessionColor = (title: string) => {
    for (const [key, value] of Object.entries(sessionColors)) {
      if (title.includes(key)) {
        return value;
      }
    }
    return sessionColors.default;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm lg:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold">Today's Plan</h3>
        <div className="flex">
          <button 
            onClick={goToPreviousDay}
            className="text-gray-500 hover:text-primary px-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-medium">{formattedDate}</span>
          <button 
            onClick={goToNextDay}
            className="text-gray-500 hover:text-primary px-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="flex-shrink-0 w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="flex-1 pb-4 border-l border-gray-200 dark:border-gray-700 pl-4 relative">
                <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                <div className="bg-gray-200 dark:bg-gray-800 rounded-lg p-3 h-24"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedSessions.length > 0 ? (
            sortedSessions.map((session) => (
              <div key={session.id} className="flex gap-4">
                <div className="flex-shrink-0 w-20 text-sm font-medium text-right pt-1">
                  {format(new Date(session.startTime), "h:mm a")}
                </div>
                <div className="flex-1 pb-4 border-l border-gray-200 dark:border-gray-700 pl-4 relative">
                  <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-primary"></div>
                  <div className={`${getSessionColor(session.title)} rounded-lg p-3 mb-1`}>
                    <h4 className="font-medium">{session.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{session.location}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {format(new Date(session.startTime), "h:mm a")} - {format(new Date(session.endTime), "h:mm a")}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No scheduled activities for this day</p>
              <button className="mt-4 text-primary text-sm">+ Add a study session</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DailySchedule;
