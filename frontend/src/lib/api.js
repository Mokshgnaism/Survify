import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
  if(signupData.isBusiness){
    const response = await axiosInstance.post("/auth/Business-register",signupData);
    return response.data;
  }
  const response = await axiosInstance.post("/auth/register", signupData);
  const respose2 = await axiosInstance.post("/auth/sendotp",signupData);//just needs email ... we need to send the 
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};
export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getSurveys = async(searchtext)=>{
  let obj = {"searchtext":`${searchtext}`}//we did not make the search text to be anything  ... 
  const respone = await axiosInstance.post("/users/getsurveys",obj);
  return respone.data.surveys;
}

export const getMySurveys = async(searchtext)=>{
  let obj = {"searchtext":`${searchtext}`}//we did not make the search text to be anything  ... 
  const respone = await axiosInstance.post("/users/getmysurveys",obj);
  return respone.data.surveys;
}

// clicked when submitting otp ... 
export const verifyEmail = async(obj) => {
  const response = await axiosInstance.post("/auth/verifyEmail",obj);
  return response.data;
}

export const addsurvey = async(surveydata) =>{
  const respone = await axiosInstance.post("/users/addsurvey",surveydata);
}
 
export const getSurveyResult = async(id)=>{
  const response = await axiosInstance.post("/users/getsurveyresult",{id});
  return response.data.survey;
}
export const changepasswordRequest = async(email) =>{
      let obj = {"email":email.tostring()}
      const response = await axiosInstance.post("/auth/sendotp",obj);
      //take them to the verification page once it is done ... 
      return response.data;
}
export const resetPassword = async(resetdata) =>{
      const response = await axiosInstance.post("/auth/changepassword",resetdata);
      return response.data;
}

export const getAuthUser = async()=>{
    const response = await axiosInstance.get("/auth/me");
    return response.data;
}