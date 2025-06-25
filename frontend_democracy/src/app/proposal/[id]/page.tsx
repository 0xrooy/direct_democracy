'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import API from '@/lib/api';
import { div } from 'framer-motion/client';


export default function ProposalDetailPage() {
  const params=useParams();
  const id =params?.id as string;
  const [proposal, setProposal] = useState<any>(null);
  const [signature, setSignature] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [decryptedResult,   setDecryptedResult]=useState<number | null>(null);
  const [isAdmin, setIsAdmin]=useState(false)

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const res = await API.get(`/proposal/${id}`);
        setProposal(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load proposal');
      }
    };

    const fetchDecrypted=async() =>{
      const token=localStorage.getItem('token');
      if (!token) return;

      try{
        const payload=JSON.parse(atob(token.split('.')[1]));
        if (payload?.role == 'admin'){
          setIsAdmin(true);
          const resultRes=await API.get(`proposal/${id}/result`,{
            headers:{
              Authorization:`Bearer ${token}`,
            },
          });
          setDecryptedResult(resultRes.data.yes_votes);
        }
      }catch(err){
        console.warn('Not admin or failed to fetch result');
      }
    };

    fetchProposal();
    fetchDecrypted();


  }, [id]);

  const handleSubmitSignature = async () => {
    if (!signature) {
      setError('Please upload a signature file');
      return;
    }

    if(!signature || !signature.name){
      setError('Signature file is missing or invalid.');
      return;
    }

    if(!id){
      setError('Proposal id missing');
      return;
    }

    console.log("Signature object:",signature);
    console.log("Uploading to proposal:",id);    

    const data = new FormData();
    data.append('signature', signature);

    const token = localStorage.getItem("token");

    

    try {
      const res = await API.post(`/proposal/${id}/sign`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Signature submitted successfully!');
      setError('');
      setProposal(res.data);
    } catch (err:any) {
      console.error("Upload Error:",err);
      if(err.response?.data?.detail){
        setError(err.response.data.detail);
      }else{
        setError('Failed to submit signature');
      }
      setSuccess('');
    }
  };

  const handleVote= async (choice: 'yes' | 'no')=>{
    const token=localStorage.getItem('token');
    if(!token){
      setError('You must login to vote');
      return;
    }

    try{
      const res=await API.post(`/proposal/${id}/vote`,{vote:choice},{
        headers:{
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccess(`Your vote for "${choice.toUpperCase()}" has been recorded.`);
      setError('');
      setProposal(res.data);
    }catch(err){
      setError('Failed to submit vote or you already voted. ')
      setSuccess('')
    }
  }




  if (!proposal) return (
    <main className="min-h-screen bg-black text-green-400 font-mono p-4">
      <p>Loading proposal...</p>
    </main>
  );

  return (
    <main className="min-h-screen bg-black text-green-400 font-mono p-6">
      <h1 className="text-3xl font-bold border-b border-green-600 pb-2 mb-4 uppercase">{proposal.title}</h1>
      <p className="mb-2">{proposal.description}</p>

      <p className="text-sm mb-1">
        State Constituencies: <span className="text-green-300">{proposal.state_constituencies?.join(', ') || 'None'}</span>
      </p>
      <p className="text-sm mb-1">
        Federal Constituencies: <span className="text-green-300">{proposal.federal_constituencies?.join(', ') || 'None'}</span>
      </p>
      <p className="text-sm mb-4">
        Status:{' '}
        <span className={
          proposal.status === 'validated'
            ? 'text-green-400'
            : proposal.status === 'pending'
            ? 'text-yellow-400'
            : 'text-gray-400'
        }>
          {proposal.status}
        </span>
      </p>

      {proposal.status !== 'validated' && (
        <div className="bg-neutral-900 p-4 border border-green-500 rounded-lg max-w-md">
          <h2 className="text-xl font-semibold mb-2 text-green-300 uppercase">Upload Signature</h2>
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.pdf"
            onChange={(e) => setSignature(e.target.files?.[0] || null)}
            className="w-full bg-black border border-green-400 p-2 text-green-200 mb-2"
          />
          <button
            onClick={handleSubmitSignature}
            className="bg-green-500 hover:bg-green-400 text-black font-bold py-2 px-4 w-full uppercase"
          >
            Submit Signature
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          {success && <p className="text-green-400 mt-2">{success}</p>}
        </div>
      )}

      {proposal.status=='validated' && (
        <div className='bg-green-950 border border-green-600 p-4 mt-6 rounded-lg max-w-md'>
          <p className='text-green-300 font-semibold mb-2'>This proposal is validated. Cast your vote now</p>

          <div className='flex flex-col gap-2'>
            <button onClick={()=>handleVote('yes')} className='bg-green-500 hover:bg-green-400 text-black font-bold py-2 px-4 w-full'>YES</button>
            <button onClick={()=>handleVote('no')} className='bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 w-full'>NO</button>
          </div>

          {success && <p className='text-green-400 mt-2'>{success}</p>}
          {error && <p className='text-red-500 mt-2'>{error}</p>}
        </div>
      )}

      {isAdmin && decryptedResult !== null && (
        <div className='bg-zinc-900 border  border-cyan-600 mt-6 p-4 rounded-lg max-w-md'>
          <h3 className='text-cyan-400 text-lg font-bold mb-2'>Admin Decrypted Result</h3>
          <p className='text-green-300'>YES Votes (FHE Encrypted): {decryptedResult}</p>
          <p className='text-sm text-gray-400 mt-1 italic'>Only visible to admins</p>
        </div>
      
      )}

    </main>
  );
}
