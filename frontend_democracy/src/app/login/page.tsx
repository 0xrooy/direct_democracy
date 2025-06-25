'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import API from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      const response = await API.post('/users/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const token = response.data.access_token;
      localStorage.setItem('token', token);
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Invalid credentials. Access denied.');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white px-4">
      <div className="bg-zinc-900/80 backdrop-blur p-8 rounded-xl shadow-lg max-w-sm w-full space-y-6 border border-zinc-800">
        <h2 className="text-2xl font-bold text-green-400 tracking-tight text-center">
           Authenticate
        </h2>

        <div>
          <label className="block mb-1 text-zinc-300 font-mono text-sm">Username</label>
          <input
            type="text"
            className="w-full p-2 rounded bg-zinc-800 text-white border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-green-400 font-mono text-sm"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
        </div>

        <div>
          <label className="block mb-1 text-zinc-300 font-mono text-sm">Password</label>
          <input
            type="password"
            className="w-full p-2 rounded bg-zinc-800 text-white border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-green-400 font-mono text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button
          onClick={handleLogin}
          className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-2 rounded transition"
        >
          Login
        </button>

        <div className="text-xs text-center text-zinc-400">
          Need an account?{' '}
          <a href="/register" className="underline hover:text-green-300">
            Register here
          </a>
        </div>
      </div>
    </main>
  );
}
