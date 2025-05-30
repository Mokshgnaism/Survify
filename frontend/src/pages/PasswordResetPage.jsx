import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { resetPassword } from "../lib/api";
import { LoaderIcon, MapPinIcon, ShipWheelIcon, ShuffleIcon } from "lucide-react";
import { LANGUAGES } from "../constants";
import { axiosInstance } from "../lib/axios";

const PasswordResetPage = () => {
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState({
    email:"",
    newPassword:"",
    otp:""
  });

  const { mutate: resetpass, isPending } = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast.success("Password reset  successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },

    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    resetpass(formState);
  };
  const {mutate:sendotp , isPending:otpload,error} = useMutation({
    mutationFn: async ()=>{
        const response = await axiosInstance.post("/auth/sendotp",{"email":`${formState.email}`});
        return response.data;
    },
    onSuccess: ()=>{
        toast.success("otp sent successfully");
        
    }
  })
 
  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="card bg-base-200 w-full max-w-3xl shadow-xl">
        <div className="card-body p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">Reset Your Password</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PROFILE PIC CONTAINER */}
            

            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="text"
                name="email"
                value={formState.email}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                className="input input-bordered w-full"
                placeholder="Your verified email"
              />
            </div>

            <button className="btn btn-primary w-full" disabled={otpload || !formState.email} onClick={
                (e)=>{
                    e.preventDefault();
                    sendotp();
                }
            }>
              {!otpload ? (
                <>
                  <ShipWheelIcon className="size-5 mr-2" />
                    send otp 
                </>
              ) : (
                <>
                  <LoaderIcon className="animate-spin size-5 mr-2" />
                  sending otp...
                </>
              )}
            </button>

            <div className="form-control">
              <label className="label">
                <span className="label-text">OTP</span>
              </label>
              <input 
                type="text"
                name="otp"
                value={formState.otp}
                onChange={(e) => setFormState({ ...formState, otp: e.target.value })}
                className="textarea textarea-bordered h-24"
                placeholder="enter the otp sent to your mail"
              />

            </div>
             <div className="form-control">
              <label className="label">
                <span className="label-text">NEW PASSWORD</span>
              </label>
              <textarea
                name="newPassword"
                value={formState.newPassword}
                onChange={(e) => setFormState({ ...formState, newPassword: e.target.value })}
                className="textarea textarea-bordered h-24"
                placeholder="enter the otp sent to your mail"
              />
            </div>

           
           

            <button className="btn btn-primary w-full" disabled={isPending} type="submit">
              {!isPending ? (
                <>
                  <ShipWheelIcon className="size-5 mr-2" />
                  Complete reset
                </>
              ) : (
                <>
                  <LoaderIcon className="animate-spin size-5 mr-2" />
                  resetting password
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default PasswordResetPage;
