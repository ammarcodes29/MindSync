import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStudySessionSchema } from "@shared/schema";
import { z } from "zod";
import { format, addDays, subDays, startOfWeek, addWeeks, subWeeks, isSameDay } from "date-fns";

type NewStudySessionFormValues = z.infer<typeof insertStudySessionSchema>;

const Schedule = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<"day" | "week">("week");
  const queryClient = useQueryClient();
  
  const form = useForm<NewStudySessionFormValues>({
    resolver: zodResolver(insertStudySessionSchema.omit({ userId: true })),
    defaultValues: {
      title: "",
      startTime: new Date(),
      endTime: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour later
      location: "",
      completed: false,
    },
  });
  
  // Get the start of the week for the current date
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday as first day
  
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  
  // Format query date for API
  const formattedQueryDate = currentView === "day" 
    ? currentDate.toISOString() 
    : weekStart.toISOString();
  
  const { data: sessions, isLoading } = useQuery({
    queryKey: ["/api/study-sessions", { date: formattedQueryDate }],
    enabled: true,
  });
  
  const { data: courses } = useQuery({
    queryKey: ["/api/courses"],
    enabled: true,
  });
  
  const createSessionMutation = useMutation({
    mutationFn: async (data: Omit<NewStudySessionFormValues, 'userId'>) => {
      return apiRequest("POST", "/api/study-sessions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-sessions"] });
      setDialogOpen(false);
      form.reset();
    },
  });
  
  const onSubmit = (data: Omit<NewStudySessionFormValues, 'userId'>) => {
    createSessionMutation.mutate(data);
  };
  
  // Navigation functions
  const goToPreviousDay = () => {
    setCurrentDate(subDays(currentDate, 1));
  };
  
  const goToNextDay = () => {
    setCurrentDate(addDays(currentDate, 1));
  };
  
  const goToPreviousWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };
  
  const goToNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Filter sessions for the selected day or week
  const filterSessionsForDay = (date: Date) => {
    if (!sessions) return [];
    
    return sessions.filter((session: any) => {
      const sessionDate = new Date(session.startTime);
      return isSameDay(sessionDate, date);
    });
  };
  
  // Time slots for day view
  const timeSlots = Array.from({ length: 14 }).map((_, i) => i + 8); // 8 AM to 9 PM
  
  // Color map for different session types
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
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar 
        isMobileOpen={isMobileMenuOpen} 
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />
      
      <main className="flex-1 overflow-y-auto">
        <Header 
          title="Schedule" 
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-xl font-semibold">My Schedule</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentView === "day" 
                  ? format(currentDate, "EEEE, MMMM d, yyyy")
                  : `Week of ${format(weekStart, "MMMM d, yyyy")}`
                }
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <Button 
                  variant={currentView === "day" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentView("day")}
                  className="rounded-lg"
                >
                  Day
                </Button>
                <Button 
                  variant={currentView === "week" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentView("week")}
                  className="rounded-lg"
                >
                  Week
                </Button>
              </div>
              
              <div className="flex items-center space-x-1">
                {currentView === "day" ? (
                  <>
                    <Button variant="outline" size="icon" onClick={goToPreviousDay}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </Button>
                    <Button variant="outline" onClick={goToToday} size="sm">Today</Button>
                    <Button variant="outline" size="icon" onClick={goToNextDay}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </Button>
                    <Button variant="outline" onClick={goToToday} size="sm">This Week</Button>
                    <Button variant="outline" size="icon" onClick={goToNextWeek}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </>
                )}
              </div>
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Session
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add Study Session</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Session Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Math Study Session" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="startTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Time</FormLabel>
                              <FormControl>
                                <Input 
                                  type="datetime-local" 
                                  {...field} 
                                  value={field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ""} 
                                  onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="endTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Time</FormLabel>
                              <FormControl>
                                <Input 
                                  type="datetime-local" 
                                  {...field} 
                                  value={field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ""} 
                                  onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Library, Study Room 4" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {courses && (
                        <FormField
                          control={form.control}
                          name="courseId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Course (Optional)</FormLabel>
                              <Select 
                                onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} 
                                value={field.value?.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select course" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {courses.map((course: any) => (
                                    <SelectItem key={course.id} value={course.id.toString()}>
                                      {course.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      <div className="flex justify-end">
                        <Button type="submit" disabled={createSessionMutation.isPending}>
                          {createSessionMutation.isPending ? "Adding..." : "Add Session"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {currentView === "day" ? (
            <Card>
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          <div className="flex-1 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {timeSlots.map((hour) => {
                      const dayHourSessions = sessions?.filter((session: any) => {
                        const sessionDate = new Date(session.startTime);
                        return isSameDay(sessionDate, currentDate) && sessionDate.getHours() === hour;
                      }) || [];
                      
                      return (
                        <div key={hour} className="flex gap-4">
                          <div className="flex-shrink-0 w-20 text-sm font-medium text-right pt-1">
                            {hour === 12 ? '12:00 PM' : hour < 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`}
                          </div>
                          <div className="flex-1 min-h-[60px] border-l border-gray-200 dark:border-gray-700 pl-4 relative">
                            {dayHourSessions.length > 0 ? (
                              dayHourSessions.map((session: any) => (
                                <div key={session.id} className="absolute -left-1.5 top-1.5">
                                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                                  <div className={`${getSessionColor(session.title)} rounded-lg p-3 ml-4 w-full`}>
                                    <h4 className="font-medium">{session.title}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{session.location}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                      {format(new Date(session.startTime), "h:mm a")} - {format(new Date(session.endTime), "h:mm a")}
                                    </p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div 
                                className="h-14 w-full rounded-lg border border-dashed border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-colors cursor-pointer flex items-center justify-center"
                                onClick={() => {
                                  const startTime = new Date(currentDate);
                                  startTime.setHours(hour, 0, 0, 0);
                                  
                                  const endTime = new Date(startTime);
                                  endTime.setHours(hour + 1, 0, 0, 0);
                                  
                                  form.setValue('startTime', startTime);
                                  form.setValue('endTime', endTime);
                                  setDialogOpen(true);
                                }}
                              >
                                <span className="text-xs text-gray-500 dark:text-gray-400">+ Add session</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-7 gap-4">
              {weekDays.map((day) => {
                const dayName = format(day, "EEE");
                const dayNumber = format(day, "d");
                const isToday = isSameDay(day, new Date());
                const daySessions = filterSessionsForDay(day);
                
                return (
                  <Card key={day.toISOString()} className={`${isToday ? 'border-primary' : ''}`}>
                    <div className={`p-2 text-center border-b ${isToday ? 'bg-primary/10' : ''}`}>
                      <div className="text-sm font-medium">{dayName}</div>
                      <div className={`text-xl ${isToday ? 'text-primary font-bold' : ''}`}>{dayNumber}</div>
                    </div>
                    <CardContent className="p-2 h-[calc(100vh-240px)] overflow-y-auto">
                      {isLoading ? (
                        <div className="space-y-2 mt-2">
                          {[1, 2].map((i) => (
                            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"></div>
                          ))}
                        </div>
                      ) : daySessions.length > 0 ? (
                        <div className="space-y-2 mt-2">
                          {daySessions.map((session: any) => (
                            <div 
                              key={session.id} 
                              className={`${getSessionColor(session.title)} p-2 rounded-lg text-sm mb-2`}
                            >
                              <div className="font-medium truncate">{session.title}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{session.location}</div>
                              <div className="text-xs mt-1">
                                {format(new Date(session.startTime), "h:mm a")} - {format(new Date(session.endTime), "h:mm a")}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div 
                          className="h-20 flex items-center justify-center border border-dashed border-gray-200 dark:border-gray-700 rounded-lg mt-2 cursor-pointer hover:border-primary dark:hover:border-primary transition-colors"
                          onClick={() => {
                            const startTime = new Date(day);
                            startTime.setHours(9, 0, 0, 0);
                            
                            const endTime = new Date(startTime);
                            endTime.setHours(10, 0, 0, 0);
                            
                            form.setValue('startTime', startTime);
                            form.setValue('endTime', endTime);
                            setDialogOpen(true);
                          }}
                        >
                          <span className="text-xs text-gray-500 dark:text-gray-400">+ Add session</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Schedule;
