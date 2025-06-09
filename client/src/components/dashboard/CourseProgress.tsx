import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Course } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CourseProgress = () => {
  const [selectedTerm, setSelectedTerm] = useState<string | undefined>(undefined);
  
  const { data: terms } = useQuery({
    queryKey: ["/api/terms"],
    enabled: true,
  });

  const { data: courses, isLoading } = useQuery({
    queryKey: ["/api/courses"],
    enabled: true,
  });

  // Example course data for initial render
  const defaultCourses: Course[] = [
    {
      id: 1,
      userId: 1,
      name: "Computer Science 101",
      instructor: "Prof. Johnson",
      progress: 78,
      grade: "A-",
      color: "#5C6DF3"
    } as Course,
    {
      id: 2,
      userId: 1,
      name: "Mathematics 201",
      instructor: "Prof. Clark",
      progress: 92,
      grade: "A",
      color: "#FC4FF6"
    } as Course,
    {
      id: 3,
      userId: 1,
      name: "History 105",
      instructor: "Prof. Edwards",
      progress: 65,
      grade: "B",
      color: "#8593E8"
    } as Course
  ];

  const displayCourses = courses || defaultCourses;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Course Progress</h3>
        <Select value={selectedTerm} onValueChange={setSelectedTerm}>
          <SelectTrigger className="w-[180px] text-sm border-0 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <SelectValue placeholder="Select Term" />
          </SelectTrigger>
          <SelectContent>
            {terms ? (
              terms.map((term: any) => (
                <SelectItem key={term.id} value={term.id.toString()}>
                  {term.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="fall2023">Fall 2023</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="bg-gray-300 dark:bg-gray-600 h-2.5 rounded-full w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {displayCourses.map((course) => (
            <div key={course.id} className="mb-4 last:mb-0">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium">{course.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{course.instructor}</p>
                </div>
                <div className="text-right">
                  <span className="font-medium" style={{ color: course.color }}>{course.progress}%</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Grade: {course.grade || "N/A"}</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="h-2.5 rounded-full" 
                  style={{ 
                    width: `${course.progress}%`,
                    backgroundColor: course.color
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseProgress;
