import { useQuery } from '@tanstack/react-query';
import React from 'react'
import { useParams } from 'react-router'
import { useQueryClient } from '@tanstack/react-query';
import {getSurveyResult} from '../lib/api.js'
import { axiosInstance } from '../lib/axios';
import { LoaderCircle } from 'lucide-react';
const SeeSurveyResult = () => {
  const { id } = useParams();

  // Fetch survey result using your getSurveyResult function
  const {
    data: surveyResult,
    isLoading: surveyResultLoading,
    isError: surveyResultError,
    error: surveyResultErrorObj,
  } = useQuery({
    queryKey: ['surveyResult', id],
    queryFn: () => getSurveyResult(id),
    enabled: !!id,
  });

  // Fetch survey details using your existing axios call
  const {
    data: survey,
    isLoading: surveyLoading,
    isError: surveyError,
    error: surveyErrorObj,
  } = useQuery({
    queryKey: ['getsurvey', id],
    queryFn: async () => {
      const res = await axiosInstance.post('/users/getsurvey', { id });
      return res.data.survey;
    },
    enabled: !!id,
  });

  if (surveyLoading || surveyResultLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderCircle className="animate-spin h-16 w-16 text-indigo-600" />
      </div>
    );
  }

  if (surveyError || surveyResultError) {
    return (
      <div className="text-center text-red-600 mt-10">
        Failed to load survey data or results.
        <br />
        <pre>{JSON.stringify(surveyErrorObj || surveyResultErrorObj, null, 2)}</pre>
      </div>
    );
  }

  if (!survey || !surveyResult) {
    return (
      <div className="text-center mt-10 text-gray-700">
        No survey or results found.
      </div>
    );
  }

  const { questions, options } = survey;
  const { results } = surveyResult; // expecting 2D array

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8 bg-gradient-to-b from-indigo-50 to-indigo-100 min-h-screen">
      <h1 className="text-5xl font-extrabold text-indigo-700 mb-8 drop-shadow-lg">
        {survey.title}
      </h1>
      <p className="text-xl text-gray-700 mb-12 max-w-3xl">
        {survey.description}
      </p>

      {questions.map((question, qIndex) => (
        <div
          key={qIndex}
          className="bg-white p-8 rounded-3xl shadow-xl border border-indigo-300 hover:scale-[1.02] transition-transform duration-300"
        >
          <h2 className="text-3xl font-semibold mb-6 text-indigo-900">
            Q{qIndex + 1}. {question}
          </h2>

          <ul className="space-y-4">
            {options[qIndex].map((option, optIndex) => {
              const count = results?.[qIndex]?.[optIndex] ?? 0;
              return (
                <li
                  key={optIndex}
                  className="flex justify-between items-center rounded-lg bg-indigo-100 p-4 shadow-md hover:bg-indigo-200 transition-colors duration-200"
                >
                  <span className="text-indigo-900 text-lg font-medium">
                    {option}
                  </span>
                  <span className="text-indigo-700 font-semibold bg-indigo-300 rounded-full px-5 py-1 text-sm select-none">
                    {count} {count === 1 ? 'vote' : 'votes'}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default SeeSurveyResult;
