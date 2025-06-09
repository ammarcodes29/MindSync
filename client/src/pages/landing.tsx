import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

const Landing = () => {
  const [_, navigate] = useLocation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-semibold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            MindSync
          </h1>
          <p className="text-xl mb-6">Your AI-powered study companion with <span className="text-accent">Neura</span> assistant</p>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Optimize your learning, track your progress, and achieve your academic goals with personalized study plans.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => navigate("/auth")}
              className="bg-primary hover:bg-primary/90 text-white font-medium rounded-lg px-8 py-3"
            >
              Get Started
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              variant="outline"
              className="border border-primary text-primary hover:bg-primary/10 font-medium rounded-lg px-8 py-3"
            >
              Log In
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 shadow-sm">
            <div className="text-primary text-2xl mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Smart Scheduling</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Plan your study sessions around your classes and commitments
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 shadow-sm">
            <div className="text-accent text-2xl mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Track Progress</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Visualize your academic journey with intuitive analytics
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 shadow-sm">
            <div className="text-secondary text-2xl mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">AI Assistance</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get personalized recommendations to improve your study habits
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
