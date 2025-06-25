'use client';

import { useEffect, useState } from 'react';
import API from '../../lib/api';
import Link from 'next/link';
import { Loader } from 'lucide-react';

export default function DashboardPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [referendums, setReferendums] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    stateConstituencies: [] as string[],
    federalConstituencies: [] as string[],
    signature: null as File | null,
  });
  const [error, setError] = useState('');

  const stateConstituenciesOptions = ['N61 Pelagus', 'N62 Katibas', 'N63 Bukit Goram', 'N03 Tanjong Datu', 'N06 Tupong'];
  const federalConstituenciesOptions = ['P.193 Santubong', 'P.194 Petra Jaya', 'P.215 Kapit'];

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const res = await API.get('/proposal/mine');
        setProposals(res.data);
      } catch (err) {
        setError('⚠️ Unable to load proposals. System failure.');
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

  const toggleCheckbox = (type: 'state' | 'federal', name: string) => {
    const key = type === 'state' ? 'stateConstituencies' : 'federalConstituencies';
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].includes(name)
        ? prev[key].filter((c: string) => c !== name)
        : [...prev[key], name],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.signature) {
      setError('All fields including signature are required.');
      return;
    }

    if (formData.stateConstituencies.length + formData.federalConstituencies.length === 0) {
      setError('Please select at least one constituency.');
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    formData.stateConstituencies.forEach((c) => data.append('stateConstituencies', c));
    formData.federalConstituencies.forEach((c) => data.append('federalConstituencies', c));
    data.append('signature', formData.signature);

    const token = localStorage.getItem('token');
    setLoading(true);

    try {
      const res = await API.post('/proposal/', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setReferendums((prev) => [...prev, res.data]);
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        stateConstituencies: [],
        federalConstituencies: [],
        signature: null,
      });
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to submit proposal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-6 bg-black text-green-400 font-mono">
      <h1 className="text-4xl font-bold mb-6 border-b border-green-400 pb-2 uppercase tracking-widest">
        Dashboard
      </h1>

      <button
        onClick={() => setShowForm(true)}
        className="bg-green-600 hover:bg-green-500 text-black font-bold px-4 py-2 mb-6 shadow-lg border border-green-300 uppercase tracking-wide"
      >
        + New Proposal
      </button>

      {showForm && (
        <div className="bg-neutral-900 p-6 border border-green-500 mb-6">
          <h2 className="text-2xl font-bold mb-4 border-b border-green-600 uppercase">New Proposal</h2>

          <div className="mb-4">
            <label className="block mb-1 text-green-300">Title</label>
            <input
              className="w-full bg-black border border-green-400 p-2 text-green-200 focus:outline-none focus:ring-2 focus:ring-green-600"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-green-300">Description</label>
            <textarea
              className="w-full bg-black border border-green-400 p-2 text-green-200 focus:outline-none focus:ring-2 focus:ring-green-600"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-green-300">State Constituency (DUN)</label>
            {stateConstituenciesOptions.map((c) => (
              <label key={c} className="block text-sm">
                <input
                  type="checkbox"
                  className="mr-2 accent-green-400"
                  checked={formData.stateConstituencies.includes(c)}
                  onChange={() => toggleCheckbox('state', c)}
                />
                {c}
              </label>
            ))}
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-green-300">Federal Constituency</label>
            {federalConstituenciesOptions.map((c) => (
              <label key={c} className="block text-sm">
                <input
                  type="checkbox"
                  className="mr-2 accent-green-400"
                  checked={formData.federalConstituencies.includes(c)}
                  onChange={() => toggleCheckbox('federal', c)}
                />
                {c}
              </label>
            ))}
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-green-300">Signature</label>
            <input
              type="file"
              className="w-full bg-black border border-green-400 p-2 text-green-200"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setFormData({ ...formData, signature: file });
              }}
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowForm(false);
                setError('');
              }}
              className="flex-1 bg-red-700 hover:bg-red-600 text-white py-2 uppercase"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-green-500 hover:bg-green-400 text-black py-2 font-bold uppercase disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      )}

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
          </Link>
        ))}
      </div>


    </main>
  );
}
