'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await API.post('/users/register', { username, email, password });
      router.push('/login');
    } catch (err: any) {
      console.error(err);
      const message = err?.response?.data?.detail || 'Registration failed';
      setError(message);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-green-400 font-mono p-4">
      <div className="bg-neutral-900 p-8 rounded-lg shadow-lg border border-green-600 max-w-sm w-full space-y-6">
        <h2 className="text-3xl font-bold text-green-300 text-center uppercase">Register</h2>

        <div>
          <label className="block mb-1">Username</label>
          <input
            type="text"
            className="w-full p-2 rounded bg-black text-green-200 border border-green-500 focus:outline-none focus:ring focus:ring-green-400"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            className="w-full p-2 rounded bg-black text-green-200 border border-green-500 focus:outline-none focus:ring focus:ring-green-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1">Password</label>
          <input
            type="password"
            className="w-full p-2 rounded bg-black text-green-200 border border-green-500 focus:outline-none focus:ring focus:ring-green-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1">Confirm Password</label>
          <input
            type="password"
            className="w-full p-2 rounded bg-black text-green-200 border border-green-500 focus:outline-none focus:ring focus:ring-green-400"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={handleRegister}
          className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-2 rounded transition uppercase"
        >
          Register
        </button>

        <div className="text-sm text-center text-green-300">
          Already have an account?{' '}
          <a href="/login" className="underline hover:text-green-400">Login here</a>
        </div>
      </div>
    </main>
  );
}
