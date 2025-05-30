import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getSurveys } from "../lib/api";
import { Link } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { LoaderCircle } from "lucide-react";
import { motion } from "framer-motion";
import LogoutButton from "../components/LogoutButton";
import ThemeSelector from "../components/ThemeSelector";
export default function HomePage() {
  const queryClient = useQueryClient();
  const { isLoading: userLoading, authUser } = useAuthUser();
  const [searchText, setSearchText] = useState("");

  const {
    data: surveys = [],
    isLoading: loadingSurveys,
  } = useQuery({
    queryKey: ["getsurvey", searchText],
    queryFn: () => getSurveys(searchText),
    keepPreviousData: true,
  });

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["getsurvey"] });
  }, [searchText, queryClient]);

  if (userLoading) {
    return (
      <div className="flex grow items-center justify-center h-screen bg-gradient-to-tr from-indigo-100 to-purple-50">
        <LoaderCircle className="animate-spin h-16 w-16 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-50 to-white p-8">
      {/* Navbar */}
      
      <header className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-6">
        
        <motion.h1
          initial={{ x: -150, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-indigo-700"
        >
          Survey Hub
        </motion.h1>
        
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search surveys..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="input input-bordered w-full max-w-md"
          />
          <Link to="/">
            <button className="btn btn-outline btn-primary">
              {authUser?.name}
            </button>
          </Link>
          <ThemeSelector/>
          <LogoutButton/>
        </div>
      </header>

      {/* Survey Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {loadingSurveys ? (
          <div className="col-span-full flex justify-center py-16">
            <LoaderCircle className="animate-spin h-16 w-16 text-indigo-600" />
          </div>
        ) : surveys.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-20">
            No surveys found.
          </div>
        ) : (
          surveys.map((survey) => (
            <motion.div
              key={survey._id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="transition-transform"
            >
              <Link to={`/surveyfill/${survey._id}`}>                
                <div className="card card-compact bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                  <div className="card-body">
                    <h2 className="card-title text-lg text-indigo-800">{survey.title}</h2>
                    <p className="text-gray-600 min-h-[3rem]">
                      {survey.description || "No description available."}
                    </p>
                    <div className="card-actions justify-end">
                      <button className="btn btn-sm btn-primary">
                        Fill Survey
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}
