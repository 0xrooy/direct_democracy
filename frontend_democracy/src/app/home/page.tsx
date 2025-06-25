'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import API from '@/lib/api';
import { Loader } from 'lucide-react';

export default function HomePage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const res = await API.get('/proposal/public');
        setProposals(res.data);
      } catch (err) {
        setError('⚠️ Unable to load proposals. System failure.');
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

  return (
    <main className="p-6 min-h-screen bg-gradient-to-br from-black via-zinc-900 to-gray-950 text-white font-mono">
      <h1 className="text-4xl font-extrabold mb-8 text-green-400 tracking-tight border-b border-green-600 pb-2">
        /public_proposals
      </h1>

      {loading && (
        <div className="flex items-center space-x-2 text-gray-400 animate-pulse">
          <Loader className="animate-spin" size={20} />
          <span>Loading proposals...</span>
        </div>
      )}

      {error && <p className="text-red-400 bg-red-950 p-2 rounded border border-red-800">{error}</p>}

      {!loading && proposals.length === 0 && (
        <p className="text-gray-500 italic">No proposals found in the public domain.</p>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
        {proposals.map((proposal) => (
          <Link
            key={proposal.id}
            href={`/proposal/${proposal.id}`}
            className="bg-zinc-800/70 border border-green-600 hover:border-cyan-400 hover:bg-zinc-800/90 transition-colors p-4 rounded-xl shadow-lg hover:scale-[1.02] duration-200 cursor-pointer"
          >
            <h2 className="text-xl font-bold text-cyan-300 mb-1">{proposal.title}</h2>
            <p className="text-sm text-zinc-300">{proposal.description}</p>
            <p className="text-xs mt-3 text-yellow-400">
              Status: <span className="uppercase tracking-wider">{proposal.status}</span>
            </p>
            <p className="text-sm mt-4">

              ✅ Yes Votes: <span className="text-green-400">{proposal.votes_yes || 0}</span><br />
              ❌ No Votes: <span className="text-red-400">{proposal.votes_no || 0}</span>
            </p>

          </Link>
        ))}
      </div>
    </main>
  );
}
