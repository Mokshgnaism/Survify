import React, { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { LoaderCircle } from "lucide-react";
import { motion } from "framer-motion";
import LogoutButton from "../components/LogoutButton";

export default function AdminHomePage() {
  const { authUser, isLoading: adminLoading } = useAuthUser();
  const queryClient = useQueryClient();
  const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "" });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["BusinessUsers"],
    queryFn: async () => {
      const res = await axiosInstance.post("/users/get-unverified-business");
      return res.data.unverifiedBusiness ?? [];
    },
  });

  const { mutate: acceptBusiness, isLoading: isAccepting } = useMutation({
    mutationFn: async (businessId) => {
      const payload = { businessid: businessId };
      return await axiosInstance.post("/auth/verify-business", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["BusinessUsers"] });
    },
  });

  const { mutate: createAdmin, isLoading: isCreating } = useMutation({
    mutationFn: async (formData) => {
      const response = await axiosInstance.post("/auth/create-admin", formData);
      console.info(`${authUser?.name || "Unknown Admin"} created new admin: ${formData.name}`);
      return response;
    },
    onSuccess: () => {
      setAdminForm({ name: "", email: "", password: "" });
    },
  });

  const { mutate: rejectBusiness, isLoading: rejecLoading } = useMutation({
    mutationFn: async (businessId) => {
      console.info(`${authUser?.name || "Unknown Admin"} rejected: ${businessId}`);
      const response = await axiosInstance.post("/auth/reject-business", { businessId });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["BusinessUsers"] });
    },
  });

  const handleAdminCreate = (e) => {
    e.preventDefault();
    if (!adminForm.name || !adminForm.email || !adminForm.password) return;
    createAdmin(adminForm);
  };

  if (adminLoading || isLoading) {
    return (
      <div className="flex grow items-center justify-center h-screen bg-gradient-to-tr from-purple-100 to-indigo-50">
        <LoaderCircle className="animate-spin h-16 w-16 text-purple-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-50 to-white px-6 sm:px-12 py-10">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-6">
        <LogoutButton />
        <motion.h1
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-indigo-800"
        >
          Admin Dashboard
        </motion.h1>
        <div className="text-right text-indigo-600 font-medium">
          Logged in as: {authUser?.name || "Unknown"}
        </div>
      </header>

      <h2 className="text-2xl font-semibold text-indigo-700 mb-6">Unverified Businesses</h2>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {users.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-12">
            No unverified businesses found.
          </div>
        ) : (
          users.map((biz) => (
            <motion.div
              key={biz._id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="transition-transform"
            >
              <div className="card w-full bg-base-100 shadow-xl border border-indigo-100">
                <div className="card-body">
                  <h2 className="card-title text-indigo-700">
                    {biz.businessName || biz.fullName || "Business"}
                  </h2>
                  <p className="text-sm">Email: {biz.email}</p>
                  <p className="text-sm">Contact: {biz.phoneNumber || "N/A"}</p>
                  <div className="card-actions justify-between mt-4">
                    <button
                      onClick={() => acceptBusiness(biz._id)}
                      className="btn btn-sm btn-success"
                      disabled={isAccepting}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => rejectBusiness(biz._id)}
                      className="btn btn-sm btn-outline btn-error"
                      disabled={rejecLoading}
                    >
                      {rejecLoading ? "Rejecting..." : "Reject"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      <motion.div
        className="bg-white border-t-4 border-indigo-500 rounded-xl p-6 shadow-xl max-w-xl mx-auto"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold text-indigo-700 mb-4">Create New Admin</h2>
        <form onSubmit={handleAdminCreate} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Name"
            value={adminForm.name}
            onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
            className="input input-bordered w-full"
          />
          <input
            type="email"
            placeholder="Email"
            value={adminForm.email}
            onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
            className="input input-bordered w-full"
          />
          <input
            type="password"
            placeholder="Password"
            value={adminForm.password}
            onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
            className="input input-bordered w-full"
          />
          <button type="submit" className="btn btn-primary" disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Admin"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
