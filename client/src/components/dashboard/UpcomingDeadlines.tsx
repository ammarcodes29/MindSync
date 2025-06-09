import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const newTaskSchema = z.object({
  name: z.string().min(1, "Task name is required"),
  taskType: z.string({
    required_error: "Task type is required",
  }),
  dueDate: z.string().min(1, "Due date is required"),
  priority: z.string().default("medium"),
  courseId: z.string().optional(),
});

type NewTaskFormValues = z.infer<typeof newTaskSchema>;

const UpcomingDeadlines = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const form = useForm<NewTaskFormValues>({
    resolver: zodResolver(newTaskSchema),
    defaultValues: {
      name: "",
      taskType: "",
      dueDate: "",
      priority: "medium",
    },
  });

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["/api/tasks/upcoming"],
    enabled: true,
  });

  const { data: courses } = useQuery({
    queryKey: ["/api/courses"],
    enabled: true,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: NewTaskFormValues) => {
      // Convert form data to appropriate format for API
      const apiData = {
        ...data,
        courseId: data.courseId ? parseInt(data.courseId) : undefined,
        dueDate: new Date(data.dueDate),
      };
      
      return apiRequest("POST", "/api/tasks", apiData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/upcoming"] });
      setDialogOpen(false);
      form.reset();
    },
  });

  const onSubmit = (data: NewTaskFormValues) => {
    createTaskMutation.mutate(data);
  };

  // Example tasks data for initial render
  const defaultTasks: Task[] = [
    {
      id: 1,
      userId: 1,
      name: "Mathematics Assignment",
      taskType: "assignment",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
      priority: "high",
      status: "incomplete",
    } as Task,
    {
      id: 2,
      userId: 1,
      name: "CS Project Milestone",
      taskType: "project",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 4)),
      priority: "medium",
      status: "incomplete",
    } as Task,
    {
      id: 3,
      userId: 1,
      name: "History Essay Draft",
      taskType: "assignment",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
      priority: "medium",
      status: "incomplete",
    } as Task,
    {
      id: 4,
      userId: 1,
      name: "Biology Report",
      taskType: "report",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 10)),
      priority: "low",
      status: "incomplete",
    } as Task
  ];

  const displayTasks = tasks || defaultTasks;
  
  // Sort tasks by due date (closest first)
  const sortedTasks = [...displayTasks].sort((a, b) => {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  // Priority styling
  const priorityStyles = {
    high: {
      border: "border-accent",
      badge: "bg-accent/20 text-accent",
    },
    medium: {
      border: "border-primary",
      badge: "bg-primary/20 text-primary",
    },
    low: {
      border: "border-gray-400",
      badge: "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400",
    },
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold">Upcoming Deadlines</h3>
        <button className="text-primary text-sm font-medium">View All</button>
      </div>

      {isLoading ? (
        <div className="space-y-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border-l-4 pl-3 animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {sortedTasks.map((task) => (
            <div key={task.id} className={`border-l-4 ${priorityStyles[task.priority as keyof typeof priorityStyles].border} pl-3`}>
              <h4 className="font-medium">{task.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Due in {formatDistanceToNow(new Date(task.dueDate))}
              </p>
              <div className="flex items-center mt-1 text-xs">
                <span className={`${priorityStyles[task.priority as keyof typeof priorityStyles].badge} rounded px-2 py-0.5`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full mt-6 border border-primary text-primary hover:bg-primary/10 font-medium rounded-lg px-4 py-2 transition">
            Add New Task
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
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
                      <Input placeholder="e.g. Mathematics Assignment" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                        <SelectItem value="report">Report</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
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
              
              {courses && (
                <FormField
                  control={form.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
  );
};

export default UpcomingDeadlines;
