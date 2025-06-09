import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";

const Settings = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  // State for user settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [studyReminders, setStudyReminders] = useState(true);
  const [deadlineReminders, setDeadlineReminders] = useState(true);
  
  const { data: settings, isLoading: isSettingsLoading } = useQuery({
    queryKey: ["/api/settings"],
    enabled: true,
  });
  
  // Update state when settings are loaded
  useEffect(() => {
    if (settings) {
      setEmailNotifications(settings.emailNotifications);
      setStudyReminders(settings.studyReminders);
      setDeadlineReminders(settings.deadlineReminders);
    }
  }, [settings]);
  
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PUT", "/api/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings updated",
        description: "Your settings have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was an error updating your settings.",
        variant: "destructive",
      });
    },
  });
  
  const handleSettingChange = (setting: string, value: boolean) => {
    const updates: Record<string, boolean> = {};
    updates[setting] = value;
    
    // Update local state
    switch (setting) {
      case "emailNotifications":
        setEmailNotifications(value);
        break;
      case "studyReminders":
        setStudyReminders(value);
        break;
      case "deadlineReminders":
        setDeadlineReminders(value);
        break;
      case "darkMode":
        setTheme(value ? "dark" : "light");
        break;
    }
    
    // Don't send darkMode to the API, it's handled by next-themes
    if (setting !== "darkMode") {
      updateSettingsMutation.mutate(updates);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar 
        isMobileOpen={isMobileMenuOpen} 
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />
      
      <main className="flex-1 overflow-y-auto">
        <Header 
          title="Settings" 
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        
        <div className="p-6">
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Manage your basic preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium">Dark Mode</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Switch between light and dark theme
                      </p>
                    </div>
                    <Switch 
                      checked={theme === "dark"} 
                      onCheckedChange={(value) => handleSettingChange("darkMode", value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium">Academic Year</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Current academic year: 2023-2024
                      </p>
                    </div>
                    <Button variant="outline">Change</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium">Study Focus Time</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Default study session duration: 60 minutes
                      </p>
                    </div>
                    <Button variant="outline">Adjust</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Manage how and when you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium">Email Notifications</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive important updates via email
                      </p>
                    </div>
                    <Switch 
                      checked={emailNotifications} 
                      onCheckedChange={(value) => handleSettingChange("emailNotifications", value)}
                      disabled={isSettingsLoading || updateSettingsMutation.isPending}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium">Study Reminders</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Get notified about upcoming study sessions
                      </p>
                    </div>
                    <Switch 
                      checked={studyReminders} 
                      onCheckedChange={(value) => handleSettingChange("studyReminders", value)}
                      disabled={isSettingsLoading || updateSettingsMutation.isPending}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium">Deadline Reminders</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Get notified about approaching deadlines
                      </p>
                    </div>
                    <Switch 
                      checked={deadlineReminders} 
                      onCheckedChange={(value) => handleSettingChange("deadlineReminders", value)}
                      disabled={isSettingsLoading || updateSettingsMutation.isPending}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your personal information and account security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-base font-medium mb-2">Profile Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Full Name</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md mt-1 bg-background"
                          placeholder="Your name"
                          defaultValue=""
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <input
                          type="email"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md mt-1 bg-background"
                          placeholder="your.email@example.com"
                          defaultValue=""
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-base font-medium mb-2">Change Password</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-sm font-medium">Current Password</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md mt-1 bg-background"
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">New Password</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md mt-1 bg-background"
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Confirm New Password</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md mt-1 bg-background"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button>Save Changes</Button>
                  </div>
                  
                  <div className="border-t pt-6 mt-6">
                    <h3 className="text-base font-medium text-red-500 mb-2">Danger Zone</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Settings;
