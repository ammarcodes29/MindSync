import { format } from "date-fns";
import ThemeToggle from "@/components/ui/theme-toggle";

interface HeaderProps {
  title: string;
  onMenuToggle: () => void;
}

const Header = ({ title, onMenuToggle }: HeaderProps) => {
  const currentDate = format(new Date(), "EEEE, MMMM d, yyyy");

  return (
    <header className="bg-background border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
      <div className="flex items-center">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuToggle}
          className="mr-4 md:hidden text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{currentDate}</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
