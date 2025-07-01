import axios, { AxiosInstance } from 'axios';
import { error } from 'console';
import { config } from 'process';

const API: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use(
  (config)=>{
    const token=typeof window !=='undefined'? localStorage.getItem('token'):null;
    console.log('[Axios Interceptor] token:', token);

    if (token){
      config.headers.Authorization=`Bearer ${token}`;
    }
    return config;
  },
  (error)=>Promise.reject(error)
)


export default API;
