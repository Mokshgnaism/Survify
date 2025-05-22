import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import {addsurvey} from '../lib/api.js'
import useAuthUser from '../hooks/useAuthUser'
// Assume addsurvey is imported from your API utilities
// import { addsurvey } from '../api/surveys'

export default function AddSurvey() {
    const {authUser}  = useAuthUser();
  const navigate = useNavigate();
  const [surveyData, setSurveyData] = useState({
    title: "",
    user:authUser._id,
    description: "",
    questions: [""],
    options: [[""]]
  });

  const { mutate: submitSurvey, isLoading } = useMutation({
    mutationFn: () => addsurvey(surveyData),
    onSuccess: () => {
      toast.success("Your monstrous survey has been created!");
      navigate('/');
    },
    onError: () => toast.error("Failed to create survey. Try again."),
  });

  const handleTitleChange = e => setSurveyData({ ...surveyData, title: e.target.value });
  const handleDescChange = e => setSurveyData({ ...surveyData, description: e.target.value });

  const addQuestion = () => {
    setSurveyData({
      ...surveyData,
      questions: [...surveyData.questions, ""],
      options: [...surveyData.options, [""]]
    });
  };

  const handleQuestionChange = (idx, e) => {
    const qs = [...surveyData.questions];
    qs[idx] = e.target.value;
    setSurveyData({ ...surveyData, questions: qs });
  };

  const addOption = qIdx => {
    const opts = [...surveyData.options];
    opts[qIdx] = [...opts[qIdx], ""];
    setSurveyData({ ...surveyData, options: opts });
  };

  const handleOptionChange = (qIdx, oIdx, e) => {
    const opts = [...surveyData.options];
    opts[qIdx][oIdx] = e.target.value;
    setSurveyData({ ...surveyData, options: opts });
  };

  const handleSubmit = () => {
    if (!surveyData.title || !surveyData.description) {
      toast.error("Title and description are required.");
      return;
    }
    submitSurvey();
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-6 text-red-600">Survey Builder</h1>

        <div className="space-y-4 mb-8">
          <input
            type="text"
            placeholder="Survey Title"
            value={surveyData.title}
            onChange={handleTitleChange}
            className="w-full p-4 rounded-lg bg-gray-900 border border-red-600 placeholder-red-500 text-white"
          />
          <textarea
            rows={3}
            placeholder="Survey Description"
            value={surveyData.description}
            onChange={handleDescChange}
            className="w-full p-4 rounded-lg bg-gray-900 border border-red-600 placeholder-red-500 text-white"
          />
        </div>

        <div className="space-y-8">
          {surveyData.questions.map((q, qIdx) => (
            <div key={qIdx} className="bg-gray-800 border-2 border-red-700 rounded-2xl p-6 relative">
              <span className="absolute -top-3 -left-3 bg-red-700 text-black px-3 py-1 rounded-full font-bold">Q{qIdx + 1}</span>
              <input
                type="text"
                placeholder="Enter question..."
                value={q}
                onChange={e => handleQuestionChange(qIdx, e)}
                className="w-full mb-4 p-3 rounded-md bg-gray-900 border border-red-600 placeholder-red-500 text-white"
              />

              <div className="space-y-3">
                {surveyData.options[qIdx].map((opt, oIdx) => (
                  <input
                    key={oIdx}
                    type="text"
                    placeholder={`Option ${oIdx + 1}`}
                    value={opt}
                    onChange={e => handleOptionChange(qIdx, oIdx, e)}
                    className="w-full p-3 rounded-md bg-gray-900 border border-red-600 placeholder-red-500 text-white"
                  />
                ))}
              </div>

              <button
                onClick={() => addOption(qIdx)}
                className="mt-4 inline-flex items-center text-red-600 hover:text-red-400 font-bold"
              >
                <span className="mr-2 text-2xl">+</span> Add Option
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={addQuestion}
            className="inline-flex items-center text-red-600 hover:text-red-400 font-bold"
          >
            <span className="mr-2 text-3xl">+</span> Add Question
          </button>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-500 transition px-8 py-3 rounded-full font-semibold text-black"
          >
            {isLoading ? 'Creating...' : 'Submit Survey'}
          </button>
        </div>
      </div>
    </div>
  )
}
