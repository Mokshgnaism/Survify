import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import { LoaderCircle, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
export default function SurveyFill() {
  const queryClient = useQueryClient();
  const { id } = useParams();
  const [answers, setAnswers] = useState([]);

  const {
    data: survey,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["survey", id],
    queryFn: async () => {
      const res = await axiosInstance.post("/users/getsurvey", { id });
      return res.data.survey;
    }
  });

  const handleSelect = (qIndex, optIndex) => {
    const updated = [...answers];
    updated[qIndex] = optIndex;
    setAnswers(updated);
  };

  const handleSubmit = async () => {
    // Ensure all questions are answered
    if (!survey || answers.length !== survey.questions.length) {
      alert("Please select an option for every question.");
      return;
    }
    // answers is array of indices
    console.log("Result array:", answers);

    // Call submission API
    await axiosInstance.post(`/users/${id}/submit`, { answers })
      .then(() => alert("Survey submitted!"))
      .catch(() => alert("Submission failed."));
    queryClient.invalidateQueries({queryKey:["getsurvey"]});

  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-tr from-indigo-50 to-purple-50">
        <LoaderCircle className="animate-spin h-20 w-20 text-indigo-500" />
      </div>
    );
  }

  if (isError) {
    console.error(error);
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 text-lg">Failed to load survey. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-indigo-100 via-white to-purple-100">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto text-center mb-10"
      >
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 drop-shadow-lg">
          {survey.title}
        </h1>
        <p className="mt-4 text-lg text-gray-700">{survey.description}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {survey.questions.map((question, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.03 }}
            className="relative bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-6 overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 opacity-20 transform rotate-45">
              <Star className="h-32 w-32 text-purple-200" />
            </div>
            <h2 className="text-2xl font-semibold text-indigo-800 mb-4">
              Q{index + 1}. {question}
            </h2>
            <ul className="space-y-2">
              {survey.options[index]?.map((option, optIndex) => (
                <li
                  key={optIndex}
                  onClick={() => handleSelect(index, optIndex)}
                  className={`flex items-center space-x-3 p-4 rounded-xl cursor-pointer transition \
                    ${answers[index] === optIndex ? 'bg-indigo-100 border border-indigo-300' : 'hover:bg-indigo-50'}`}
                >
                  <Star className="h-5 w-5 text-indigo-500" />
                  <span className="text-gray-800 font-medium">{option}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        <Link to="/">
          <motion.button
            onClick={handleSubmit}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-2xl transition"
          >
            Submit Answers
          </motion.button>
        </Link>


      </div>
    </div>
  );
}