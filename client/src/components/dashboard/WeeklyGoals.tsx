import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Goal } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const newGoalSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

type NewGoalFormValues = z.infer<typeof newGoalSchema>;

const WeeklyGoals = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const form = useForm<NewGoalFormValues>({
    resolver: zodResolver(newGoalSchema),
    defaultValues: {
      title: "",
    },
  });

  const { data: goals, isLoading } = useQuery({
    queryKey: ["/api/goals"],
    enabled: true,
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: NewGoalFormValues) => {
      return apiRequest("POST", "/api/goals", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setDialogOpen(false);
      form.reset();
    },
  });

  const toggleGoalMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      return apiRequest("PUT", `/api/goals/${id}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
  });

  const onSubmit = (data: NewGoalFormValues) => {
    createGoalMutation.mutate(data);
  };

  const toggleGoal = (id: number, completed: boolean) => {
    toggleGoalMutation.mutate({ id, completed: !completed });
  };

  // Example goal data for initial render
  const defaultGoals: Goal[] = [
    { id: 1, userId: 1, title: "Study 3 hours for CS Midterm", completed: false },
    { id: 2, userId: 1, title: "Complete Math Assignment", completed: true },
    { id: 3, userId: 1, title: "Read Chapter 7 of History Textbook", completed: false },
    { id: 4, userId: 1, title: "Prepare notes for Biology project", completed: false },
  ] as Goal[];

  const displayGoals = goals || defaultGoals;
  
  // Calculate progress
  const totalGoals = displayGoals.length;
  const completedGoals = displayGoals.filter(goal => goal.completed).length;
  const progressPercent = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold">Weekly Goals</h3>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" className="text-primary text-sm font-medium p-0 h-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Goal</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Description</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Study 3 hours for CS Midterm" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={createGoalMutation.isPending}>
                    {createGoalMutation.isPending ? "Adding..." : "Add Goal"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center space-x-3 mb-3 animate-pulse">
              <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {displayGoals.map((goal) => (
            <div key={goal.id} className="flex items-center space-x-3 mb-3">
              <div className="relative w-5 h-5 rounded-full flex items-center justify-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="absolute w-5 h-5 opacity-0 cursor-pointer peer"
                  checked={goal.completed}
                  onChange={() => toggleGoal(goal.id, goal.completed)}
                />
                <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full peer-checked:border-primary peer-checked:dark:border-primary"></div>
                <div className="absolute w-3 h-3 bg-primary rounded-full hidden peer-checked:block"></div>
              </div>
              <span className={`text-sm ${goal.completed ? "line-through text-gray-500 dark:text-gray-400" : ""}`}>
                {goal.title}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Goal Progress</span>
          <span className="text-sm text-primary font-medium">{progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
          <div 
            className="bg-primary h-2.5 rounded-full" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyGoals;
