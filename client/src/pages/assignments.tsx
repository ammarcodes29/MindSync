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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTaskSchema } from "@shared/schema";
import { z } from "zod";
import { format, formatDistanceToNow } from "date-fns";

type NewTaskFormValues = z.infer<typeof insertTaskSchema>;

const Assignments = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const form = useForm<NewTaskFormValues>({
    resolver: zodResolver(insertTaskSchema.omit({ userId: true })),
    defaultValues: {
      name: "",
      description: "",
      taskType: "assignment",
      priority: "medium",
      status: "incomplete",
    },
  });
  
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["/api/tasks"],
    enabled: true,
  });
  
  const { data: courses } = useQuery({
    queryKey: ["/api/courses"],
    enabled: true,
  });
  
  const createTaskMutation = useMutation({
    mutationFn: async (data: Omit<NewTaskFormValues, 'userId'>) => {
      return apiRequest("POST", "/api/tasks", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setDialogOpen(false);
      form.reset();
    },
  });
  
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<NewTaskFormValues> }) => {
      return apiRequest("PUT", `/api/tasks/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });
  
  const onSubmit = (data: Omit<NewTaskFormValues, 'userId'>) => {
    createTaskMutation.mutate(data);
  };
  
  const toggleTaskStatus = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "complete" ? "incomplete" : "complete";
    updateTaskMutation.mutate({ id, data: { status: newStatus } });
  };
  
  const filterTasks = (taskType: string) => {
    if (!tasks) return [];
    return tasks.filter((task: any) => task.taskType === taskType);
  };
  
  const assignmentTasks = filterTasks("assignment");
  const examTasks = filterTasks("exam");
  const quizTasks = filterTasks("quiz");
  const projectTasks = filterTasks("project");
  
  // Priority styling
  const priorityStyles: Record<string, string> = {
    high: "border-accent",
    medium: "border-primary",
    low: "border-gray-400",
  };
  
  // Status styling
  const statusStyles: Record<string, string> = {
    complete: "bg-green-500/10 text-green-500",
    incomplete: "bg-amber-500/10 text-amber-500",
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar 
        isMobileOpen={isMobileMenuOpen} 
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />
      
      <main className="flex-1 overflow-y-auto">
        <Header 
          title="Assignments" 
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">My Tasks</h2>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Math Homework" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Task details..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="taskType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Task Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select task type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="assignment">Assignment</SelectItem>
                                <SelectItem value="project">Project</SelectItem>
                                <SelectItem value="exam">Exam</SelectItem>
                                <SelectItem value="quiz">Quiz</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date</FormLabel>
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
                      <Button type="submit" disabled={createTaskMutation.isPending}>
                        {createTaskMutation.isPending ? "Adding..." : "Add Task"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          <Tabs defaultValue="assignments" className="space-y-6">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="exams">Exams</TabsTrigger>
              <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
            </TabsList>
            
            <TabsContent value="assignments">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl h-24"></div>
                  ))}
                </div>
              ) : assignmentTasks.length > 0 ? (
                <div className="space-y-4">
                  {assignmentTasks.map((task: any) => (
                    <Card key={task.id} className={`border-l-4 ${priorityStyles[task.priority]}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="relative w-5 h-5 mt-1 rounded-full flex items-center justify-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="absolute w-5 h-5 opacity-0 cursor-pointer peer"
                                checked={task.status === "complete"}
                                onChange={() => toggleTaskStatus(task.id, task.status)}
                              />
                              <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full peer-checked:border-primary peer-checked:dark:border-primary"></div>
                              <div className="absolute w-3 h-3 bg-primary rounded-full hidden peer-checked:block"></div>
                            </div>
                            <div className={task.status === "complete" ? "line-through text-gray-500" : ""}>
                              <h3 className="font-medium">{task.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {task.dueDate && (
                                  <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                    Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                                  </span>
                                )}
                                <span className={`text-xs ${statusStyles[task.status]} px-2 py-1 rounded`}>
                                  {task.status === "complete" ? "Completed" : "Pending"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <Button variant="ghost" size="sm">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                              </svg>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <h3 className="text-lg font-medium mb-2">No assignments yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first assignment</p>
                  <Button onClick={() => setDialogOpen(true)}>Add Assignment</Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="exams">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl h-24"></div>
                  ))}
                </div>
              ) : examTasks.length > 0 ? (
                <div className="space-y-4">
                  {examTasks.map((task: any) => (
                    <Card key={task.id} className={`border-l-4 ${priorityStyles[task.priority]}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="relative w-5 h-5 mt-1 rounded-full flex items-center justify-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="absolute w-5 h-5 opacity-0 cursor-pointer peer"
                                checked={task.status === "complete"}
                                onChange={() => toggleTaskStatus(task.id, task.status)}
                              />
                              <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full peer-checked:border-primary peer-checked:dark:border-primary"></div>
                              <div className="absolute w-3 h-3 bg-primary rounded-full hidden peer-checked:block"></div>
                            </div>
                            <div className={task.status === "complete" ? "line-through text-gray-500" : ""}>
                              <h3 className="font-medium">{task.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {task.dueDate && (
                                  <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                    Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                                  </span>
                                )}
                                <span className={`text-xs ${statusStyles[task.status]} px-2 py-1 rounded`}>
                                  {task.status === "complete" ? "Completed" : "Pending"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <Button variant="ghost" size="sm">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                              </svg>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-medium mb-2">No exams yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Add your upcoming exams</p>
                  <Button onClick={() => setDialogOpen(true)}>Add Exam</Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="quizzes">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl h-24"></div>
                  ))}
                </div>
              ) : quizTasks.length > 0 ? (
                <div className="space-y-4">
                  {quizTasks.map((task: any) => (
                    <Card key={task.id} className={`border-l-4 ${priorityStyles[task.priority]}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="relative w-5 h-5 mt-1 rounded-full flex items-center justify-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="absolute w-5 h-5 opacity-0 cursor-pointer peer"
                                checked={task.status === "complete"}
                                onChange={() => toggleTaskStatus(task.id, task.status)}
                              />
                              <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full peer-checked:border-primary peer-checked:dark:border-primary"></div>
                              <div className="absolute w-3 h-3 bg-primary rounded-full hidden peer-checked:block"></div>
                            </div>
                            <div className={task.status === "complete" ? "line-through text-gray-500" : ""}>
                              <h3 className="font-medium">{task.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {task.dueDate && (
                                  <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                    Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                                  </span>
                                )}
                                <span className={`text-xs ${statusStyles[task.status]} px-2 py-1 rounded`}>
                                  {task.status === "complete" ? "Completed" : "Pending"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <Button variant="ghost" size="sm">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                              </svg>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-medium mb-2">No quizzes yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Add your upcoming quizzes</p>
                  <Button onClick={() => setDialogOpen(true)}>Add Quiz</Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="projects">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl h-24"></div>
                  ))}
                </div>
              ) : projectTasks.length > 0 ? (
                <div className="space-y-4">
                  {projectTasks.map((task: any) => (
                    <Card key={task.id} className={`border-l-4 ${priorityStyles[task.priority]}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="relative w-5 h-5 mt-1 rounded-full flex items-center justify-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="absolute w-5 h-5 opacity-0 cursor-pointer peer"
                                checked={task.status === "complete"}
                                onChange={() => toggleTaskStatus(task.id, task.status)}
                              />
                              <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full peer-checked:border-primary peer-checked:dark:border-primary"></div>
                              <div className="absolute w-3 h-3 bg-primary rounded-full hidden peer-checked:block"></div>
                            </div>
                            <div className={task.status === "complete" ? "line-through text-gray-500" : ""}>
                              <h3 className="font-medium">{task.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {task.dueDate && (
                                  <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                    Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                                  </span>
                                )}
                                <span className={`text-xs ${statusStyles[task.status]} px-2 py-1 rounded`}>
                                  {task.status === "complete" ? "Completed" : "Pending"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <Button variant="ghost" size="sm">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                              </svg>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Add your ongoing projects</p>
                  <Button onClick={() => setDialogOpen(true)}>Add Project</Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Assignments;
