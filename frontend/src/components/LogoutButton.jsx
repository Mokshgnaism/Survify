import React from 'react'
import { axiosInstance } from '../lib/axios'
import { useMutation } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
const LogoutButton = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const {mutate,isLoading} = useMutation({
        mutationFn:async () => {
            const response = await axiosInstance.post("/auth/logout");
            return response.data;
        },
        onSuccess: async()=>{
            const response = await queryClient.invalidateQueries({queryKey:["authUser"]});
            toast.success("logged out successfully bro");
            window.location.reload();
        }
    })
  return (
    <div>
        <button className='btn btn-primary stroke-yellow-50' onClick = {(e)=>{e.preventDefault();mutate();}}>logout</button>
    </div>
  )
}

export default LogoutButton
