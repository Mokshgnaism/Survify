import mongoose from "mongoose";
import User from "./user.js";
const surveySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    user:{
        type:String,
        required: true,
    },
    description: {
    type: String,
    required: true,
    },
  questions: {
    type: [String],  
    required: true,
  },
  options: {
    type: [[String]], 
    required: true,
  },
  filledUsers:{
    type:[String],
    default:[]
  }
}, { timestamps: true });

const surveyResultSchema = new mongoose.Schema({
  surveyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Survey",
    required: true,
  },
  results: {
    type: [[Number]],
    required: true,
  },
}, { timestamps: true });

const Survey = mongoose.model("Survey", surveySchema);
const SurveyResult = mongoose.model("SurveyResult", surveyResultSchema);

export { Survey, SurveyResult };
