import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { verifyEmail } from "../lib/api";
import { LoaderIcon, MapPinIcon, ShipWheelIcon, ShuffleIcon } from "lucide-react";
import LogoutButton from "../components/LogoutButton";
const EmailVerificationPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const [otp,setotp] = useState("");

  
  const { mutate: emailverification, isPending } = useMutation({
    mutationFn: verifyEmail,
    onSuccess: () => {
      toast.success("email verified successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },

    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const obj = {
      "email":authUser?.email,
      "otp":otp.toString()
    }
    emailverification(obj);
  };

 
  return (
    
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="card bg-base-200 w-full max-w-3xl shadow-xl">
        <div className="card-body p-6 sm:p-8">
          <LogoutButton/>
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">Complete Your Verification</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PROFILE PIC CONTAINER */}
           

            {/* FULL NAME */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">OTP</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={otp}
                onChange={(e) => setotp(e.target.value)}
                className="input input-bordered w-full"
                placeholder="Enter the OTP"
              />
            </div>

            <button className="btn btn-primary w-full" disabled={isPending} type="submit">
              {!isPending ? (
                <>
                  <ShipWheelIcon className="size-5 mr-2" />
                  Complete Onboarding
                </>
              ) : (
                <>
                  <LoaderIcon className="animate-spin size-5 mr-2" />
                  Onboarding...
                </>
              )}
            </button>


          </form>
        </div>
      </div>
    </div>
  );
};
export default EmailVerificationPage;
