import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Loader2, XCircle, CheckCircle2 } from 'lucide-react';

export default function SpotifyCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const hasCalled = useRef(false);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (!code && !error) return;
    if (hasCalled.current) return;
    hasCalled.current = true;

    if (error) {
      setStatus('error');
      setErrorMessage(error);
      if (window.opener) {
        window.opener.postMessage({ type: 'SPOTIFY_AUTH_ERROR', error }, '*');
        setTimeout(() => window.close(), 2000);
      }
      return;
    }

    if (code && state) {
      axios.post('/api/spotify/callback', { code, state })
        .then(() => {
          setStatus('success');
          checkAuth();
          if (window.opener) {
            window.opener.postMessage({ type: 'SPOTIFY_AUTH_SUCCESS' }, '*');
            setTimeout(() => window.close(), 1500);
          } else {
            setTimeout(() => navigate('/spotify'), 1500);
          }
        })
        .catch((err) => {
          console.error('Token exchange failed:', err);
          setStatus('error');
          setErrorMessage(err.response?.data?.error || 'Failed to exchange token');
          if (window.opener) {
            window.opener.postMessage({ type: 'SPOTIFY_AUTH_ERROR', error: 'Token exchange failed' }, '*');
            setTimeout(() => window.close(), 3000);
          }
        });
    } else {
      setStatus('error');
      setErrorMessage('Invalid callback parameters');
    }
  }, [searchParams, navigate, checkAuth]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-4 text-white">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex max-w-md flex-col items-center rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl"
      >
        {status === 'loading' && (
          <>
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-[#1DB954]" />
            <h2 className="text-xl font-bold">Connecting to Spotify...</h2>
            <p className="mt-2 text-sm text-gray-400">Please wait while we finalize the connection.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              <CheckCircle2 className="mb-4 h-16 w-16 text-[#1DB954]" />
            </motion.div>
            <h2 className="text-xl font-bold text-[#1DB954]">Successfully Connected!</h2>
            <p className="mt-2 text-sm text-gray-400">This window will close automatically.</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="mb-4 h-16 w-16 text-red-500" />
            <h2 className="text-xl font-bold text-red-500">Connection Failed</h2>
            <p className="mt-2 text-sm text-gray-400">{errorMessage}</p>
            <p className="mt-4 text-xs text-gray-500">You can close this window and try again.</p>
          </>
        )}
      </motion.div>
    </div>
  );
}
