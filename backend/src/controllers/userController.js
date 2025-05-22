import { Survey, SurveyResult } from "../models/survey.js";
import { User } from "../models/user.js";
import express from "express";
export async function getsurveys(req, res) {
    try {
        const userid = req.user._id;
        const searchtext = req.body.searchtext;


        if (!searchtext || searchtext === "") {
            const surveys = await Survey.find({filledUsers:{$nin:[userid]}});
            return res.status(200).json({
                success: true,
                surveys,
            });
        }

        
        const surveys = await Survey.find({
            $and: [
                {
                    $or: [
                        { title: { $regex: searchtext, $options: "i" } },
                        { description: { $regex: searchtext, $options: "i" } }
                    ]
                },
                {
                    filledUsers: { $nin: [userid] }  
                }
            ]
        });

        return res.status(200).json({
            success: true,
            surveys,
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: e.message,
        });
    }
}

export async function addsurvey(req, res) {//we will have a middle ware to check if user is logged in and has a valid token . for manager purpose and send the req.user = user 
    const {title,description,questions,options} = req.body;
    try{
        const survey = await Survey.create({
            title,
            description,
            questions:questions,
            options:options,
            user:req.user._id
        });
        const result = await SurveyResult.create({
            surveyId:survey._id,
            results:options.map((option)=>option.map(()=>0))
        })
        return res.status(200).json({
            success:true,
            survey:survey,
            result:result
        })
    }
    catch(e){
        return res.status(500).json({
            success:false,
            message:"Server error",
            error:e.message
        })
    }
}
export async function getBusinessSurveys(req,res){
    try{
        const searchtext = req.body.searchtext;
        if(!searchtext){
            const surveys = await Survey.find({user:req.user._id});
             return res.status(200).json({
            success:true,
            surveys:surveys
        })
        }
        const surveys = await Survey.find({user:req.user._id,$or:[{title:{$regex:searchtext,$options:"i"}},{description:{$regex:searchtext,$options:"i"}}]});
        return res.status(200).json({
            success:true,
            surveys:surveys
        })
    }
    catch(e){
        return res.status(500).json({
            success:false,
            message:"Server error",
            error:e.message
        })
    }
}

export async function getsurveyResult(req,res){
    try {
       
        const surveyId = req.body.id;
        const result = await SurveyResult.findOne({surveyId:surveyId});
        if(!result){
            return res.status(404).json({
                success:false,
                message:"Survey result not found"
            })
        }
        return res.status(200).json({
            success:true,
            survey:result
        })
    } catch (e) {
        return res.status(500).json({
            success:false,
            message:"Server error",
            error:e.message
        })
    }
}

export async function getsurvey(req,res){
    try {
        const surveyId = req.body.id;
        const survey = await Survey.findById(surveyId);
        if(!survey){
            return res.status(404).json({
                success:false,
                message:"Survey not found"
            })
        }
        return res.status(200).json({
            success:true,
            survey:survey
        })
    } catch (e) {
        return res.status(500).json({
            success:false,
            message:"Server error",
            error:e.message
        })
    }
}

export async function submitSurveyResult(req, res) {
  try {
    const surveyId = req.params.id;
    const { answers } = req.body;
    const userId = req.user._id;
    console.log("submitSurveyResult called for surveyId:", surveyId);
    console.log("Received answers:", answers);

    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ success: false, message: "Survey not found" });
    }

    if (!survey.filledUsers.includes(userId)) {
    survey.filledUsers.push(userId);
    await survey.save();
    }

    if (!Array.isArray(answers) || answers.length !== survey.questions.length) {
      return res.status(400).json({ success: false, message: "Invalid answers length" });
    }

    // Create one-hot matrix
    const newMatrix = answers.map((selIdx, q) =>
      survey.options[q].map((_, optIdx) => (optIdx === selIdx ? 1 : 0))
    );
    console.log("New matrix:", newMatrix);

    // Fetch or initialize result doc
    let resultDoc = await SurveyResult.findOne({ surveyId });

    if (!resultDoc) {
      // No existing results, create new
      resultDoc = new SurveyResult({ surveyId, results: newMatrix });
      console.log("Creating new SurveyResult");
    } else {
      console.log("Existing results:", resultDoc.results);
      // Ensure shape matches
      if (!Array.isArray(resultDoc.results) || resultDoc.results.length !== newMatrix.length) {
        // Reset to newMatrix if shape mismatch
        resultDoc.results = newMatrix;
        console.log("Resetting results due to shape mismatch");
      } else {
        // Sum matrices element-wise
        const summed = resultDoc.results.map((row, rIdx) =>
          row.map((val, cIdx) => val + newMatrix[rIdx][cIdx])
        );
        resultDoc.results = summed;
        console.log("Updated summed results:", resultDoc.results);
      }
    }

    await resultDoc.save();
    return res.status(200).json({ success: true, data: resultDoc });

  } catch (e) {
    console.error("Error in submitSurveyResult:", e);
    return res.status(500).json({ success: false, message: "Server error", error: e.message });
  }
}
// import { Survey } from "../models/Survey.js"; // Adjust path if needed

export async function deleteSurvey(req, res) {
  try {
    const surveyId = req.params.id || req.body.id  
    const userId = req.user._id;
    if(req.user.role==="user"){
        return res.status(401).json({message:"unauthorized you are a user how did you get the route ... "});
    }
    console.log(userId);
    if (!surveyId || !userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const survey = await Survey.findOne({ _id: surveyId, user: userId });

    if (!survey) {
      return res.status(404).json({ message: "Survey not found or unauthorized" });
    }

    await Survey.deleteOne({ _id: surveyId });
    return res.status(200).json({ message: "Survey deleted successfully" });

  } catch (e) {
    const userId = req.user._id;
    console.log(req.user);
    console.log(userId);
    return res.status(500).json({ message: "Server error", error: e.message });
  }
}

export async function getUnverifiedBusiness(req,res) {
    try {
    const users = await User.find({
       role:"manager",
        isVerified:false
    })
    
    return res.status(200).json({
        message:"success",
        unverifiedBusiness:users
    })

    } catch (e) {
    const userId = req.user._id;
    console.log(req.user);
    console.log(userId);
    return res.status(500).json({ message: "Server error", error: e.message });
    }
}