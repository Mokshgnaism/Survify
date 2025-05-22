import React from 'react';
import { motion } from 'framer-motion';
import { Loader, LogOut } from 'lucide-react';
import LogoutButton from "../components/LogoutButton"
export default function AdminPending() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-800 flex items-center justify-center p-6">
      <LogoutButton/>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="bg-white/20 backdrop-blur-lg rounded-3xl p-12 max-w-md text-center shadow-2xl"
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          className="flex items-center justify-center mb-6"
        >
          <Loader className="h-24 w-24 text-white" />
        </motion.div>

        <h1 className="text-4xl font-extrabold text-white mb-4 drop-shadow-lg">
          Almost There...
        </h1>

        <p className="text-lg text-gray-200 mb-8">
          Please wait while our administrators review your proposal.
          <br />
          We appreciate your patience and will update you shortly.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-4 inline-flex items-center px-6 py-3 bg-indigo-500/80 hover:bg-indigo-500 text-white text-lg font-medium rounded-full shadow-md transition"
        >
          <span className="mr-2">Check Status</span>
          <Loader className="h-5 w-5" />
        </motion.button>
      </motion.div>
    </div>
  );
}
