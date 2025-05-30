import { Navigate, Route, Routes } from "react-router";

import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";

// import Ema from "./pages/OnboardingPage.jsx";
import EmailVerificationPage from "./pages/EmailVerificationPage.jsx";
import ManagerHomePage from "./pages/ManagerHomePage.jsx";
import { Toaster } from "react-hot-toast";
import PasswordResetPage from "./pages/PasswordResetPage.jsx";
import PageLoader from "./components/PageLoader.jsx";
import useAuthUser from "./hooks/useAuthUser.js";
import Layout from "./components/Layout.jsx";
import { useThemeStore } from "./store/useThemeStore.js";
import SurveyFill from "./pages/SurveyFill.jsx";
// import EmailVerificationPage from "./pages/EmailVerificationPage.jsx";
import AdminPending from "./pages/AdminPending.jsx";
import AddSurvey from "./pages/addSurvey.jsx";
import { User } from "lucide-react";
import SeeSurveyResult from "./pages/seeSurveyResult.jsx";
import AdminHomePage from "./pages/AdminHomePage.jsx";
const App = () => {
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();

  const isAuthenticated = Boolean(authUser);
  const isVerified = authUser?.isVerified;
  const role = authUser?.role;
  //make sure you are protecting the backennd routes based on roles ... we forgot to add middle ware initially ... 
  if (isLoading) return <PageLoader />;

  return (
    <div className="h-screen" data-theme={theme}>


      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated && isVerified ? (
              <Layout showSidebar={true}>
                {role === "user" && <HomePage />}
                {role === "admin" &&  <AdminHomePage/>}
                {role === "manager" && <ManagerHomePage/>}
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/verification"} />
            )
          }
        />

        <Route
          path="/surveyfill/:id"
          element={
            !isAuthenticated ? <SignUpPage /> : <SurveyFill/>
          }
        />

        <Route
          path="/signup"
          element={
            !isAuthenticated ? <SignUpPage /> : <Navigate to={isVerified ? "/" : "/verification"} />
          }
        />

        <Route
          path="/login"
          element={
            !isAuthenticated ? <LoginPage /> : <Navigate to={isVerified ? "/" : "/verification"} />
          }
        />

        <Route
          path="/password-reset"
          element={
            <PasswordResetPage/>
          }
        />

        {/* login and register will not be having  any problem for now atleast lets say they have like same user things . but now we want to initate two types of registers ... which is not difficult and all . but needs two pages ... either we semd the mails saying your application to our platform has been accepted or rejected by our admin . so we will need two pages at register page below the regiser button we will have  a register as a business button . which will lead to another page . where you submit your request . then only the ..or just have a verification button register ffor business ... checking that button means you will send a request or you will just register as a user ...this request will be added to the queue . and will be seen by the admin...*/}
        {/* login doesnt need anything special since on login it takes you back to homepage annd based on conditional rendering  ... you will be directed to user or admin or business homepage */}


        <Route
          path="/verification"
          element={
            isAuthenticated ? (
              !isVerified ? (
                (role==="user")?(<EmailVerificationPage/>):(<AdminPending/>)
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
        path="/addsurvey"
        element = {<AddSurvey/>}
        />

        <Route
        path="/surveyresult/:id"
        element = {<SeeSurveyResult/>}
        />


      </Routes>

      <Toaster />
    </div>
  );
};
export default App;
