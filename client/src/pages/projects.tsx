import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTaskSchema } from "@shared/schema";
import { z } from "zod";
import { format, formatDistanceToNow } from "date-fns";

type NewProjectFormValues = z.infer<typeof insertTaskSchema>;

const Projects = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const form = useForm<NewProjectFormValues>({
    resolver: zodResolver(insertTaskSchema.omit({ userId: true })),
    defaultValues: {
      name: "",
      description: "",
      taskType: "project",
      priority: "medium",
      status: "incomplete",
    },
  });
  
  const { data: projects, isLoading } = useQuery({
    queryKey: ["/api/tasks", { type: "project" }],
    enabled: true,
  });
  
  const { data: courses } = useQuery({
    queryKey: ["/api/courses"],
    enabled: true,
  });
  
  const createProjectMutation = useMutation({
    mutationFn: async (data: Omit<NewProjectFormValues, 'userId'>) => {
      return apiRequest("POST", "/api/tasks", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", { type: "project" }] });
      setDialogOpen(false);
      form.reset();
    },
  });
  
  const onSubmit = (data: Omit<NewProjectFormValues, 'userId'>) => {
    createProjectMutation.mutate(data);
  };
  
  // Priority styling
  const priorityColors: Record<string, string> = {
    high: "text-accent",
    medium: "text-primary",
    low: "text-gray-500",
  };
  
  // Fake progress data (would be calculated from tasks in a real app)
  const getProjectProgress = (project: any) => {
    // This is where you would calculate progress based on completed sub-tasks
    // For now, we'll use a random progress value between 0-100
    return project.id % 100;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar 
        isMobileOpen={isMobileMenuOpen} 
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />
      
      <main className="flex-1 overflow-y-auto">
        <Header 
          title="Projects" 
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">My Projects</h2>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Research Paper" {...field} />
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
                            <Textarea placeholder="Project details..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
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
                              <FormLabel>Course</FormLabel>
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
                    
                    <div className="flex justify-end">
                      <Button type="submit" disabled={createProjectMutation.isPending}>
                        {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl h-60"></div>
              ))}
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project: any) => {
                const progress = getProjectProgress(project);
                
                return (
                  <Card key={project.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>{project.name}</CardTitle>
                        <span className={`text-xs font-medium ${priorityColors[project.priority]}`}>
                          {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{project.description}</p>
                      
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      
                      {project.courseId && courses && (
                        <div className="mt-4 text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Course: </span>
                          <span>{
                            courses.find((c: any) => c.id === project.courseId)?.name || "Unknown Course"
                          }</span>
                        </div>
                      )}
                      
                      {project.dueDate && (
                        <div className="mt-2 text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Due: </span>
                          <span>{formatDistanceToNow(new Date(project.dueDate), { addSuffix: true })}</span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      <Button variant="outline" className="w-full">View Details</Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <h3 className="text-lg font-medium mb-2">No projects yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first project to get started</p>
              <Button onClick={() => setDialogOpen(true)}>Create New Project</Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Projects;
