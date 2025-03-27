import { useState } from 'react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Optimize Your Study Time with AI
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mb-6">
          A personalized study planner that adapts to your learning pace and deadlines.
        </p>
        <div className="flex space-x-4">
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: '#6366F1' }}
            whileTap={{ scale: 0.95 }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-2xl shadow-md"
          >
            Get Started
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: '#E5E7EB', color: '#111827' }}
            whileTap={{ scale: 0.95 }}
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-2xl shadow-md"
          >
            Login
          </motion.button>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mt-12"
        >
          <img src="/illustration.svg" alt="Illustration" className="w-64 md:w-96 mx-auto" />
        </motion.div>
      </section>

      {/* Key Features Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              'AI-Powered Adaptive Scheduling',
              'Study Progress & Insights',
              'Smart Reminders & Deadlines',
              'Task & Goal Management'
            ].map((title, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl shadow-lg"
              >
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-sm opacity-70">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {["Sign Up & Set Goals", "AI Generates Personalized Plan", "Track Progress & Improve"].map(
              (step, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl shadow-lg"
                >
                  <div className="text-4xl font-bold mb-2">{index + 1}</div>
                  <p className="text-lg font-semibold">{step}</p>
                </motion.div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t dark:border-gray-700 text-center">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="mb-4 px-4 py-2 rounded-full border text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {darkMode ? 'Dark' : 'Light'} Mode
        </button>

        <div className="flex justify-center space-x-6 text-sm opacity-70">
          <a href="#">Docs</a>
          <a href="#">About</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </div>
  );
}
