/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Key, Mail, User, Info, ArrowLeft } from 'lucide-react';
import { loginUser } from '../utils/api';

interface AuthScreenProps {
  onSuccess: (token: string, profile: any) => void;
  onBack: () => void;
  locale?: 'en' | 'id';
}

export function AuthScreen({ onSuccess, onBack, locale = 'id' }: AuthScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isId = locale === 'id';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError(isId ? 'Silakan isi kedua kolom tersebut.' : 'Please fill in both fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await loginUser(username.trim(), password);
      onSuccess(data.token, data.profile);
    } catch (err: any) {
      setError(err.message || (isId ? 'Gagal masuk. Silakan periksa nama pengguna & kata sandi Anda.' : 'Login failed. Check credentials.'));
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center px-4 py-8 font-sans">
      <div className="absolute top-4 left-4">
        <button
          onClick={onBack}
          id="btn-back-to-landing"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800 transition cursor-pointer"
        >
          <ArrowLeft size={14} /> {isId ? 'Kembali' : 'Back to Hub'}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm mx-auto bg-zinc-900 border border-zinc-800 rounded-lg p-5 shadow-neon hover:shadow-neon-strong transition-all duration-500 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500 shadow-neon" />
        
        <div className="flex flex-col items-center mb-6">
          <div className="w-10 h-10 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-2.5 text-sky-400 shadow-neon">
            <Shield size={20} className="drop-shadow-neon" />
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white font-sans text-center drop-shadow-neon">
            {isId ? 'Autentikasi Terminal' : 'Genesis Terminal Auth'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1 text-center font-mono">
            {isId ? 'Masukkan sandi kredensial pengaman' : 'Enter security token credentials'}
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded bg-red-950/80 border border-red-800/60 text-xs text-red-200 font-sans flex items-start gap-2">
            <Info size={14} className="flex-shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-zinc-300 uppercase tracking-wider mb-1.5">{isId ? 'Nama Pengguna' : 'Username'}</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-2.5 text-zinc-500" />
              <input
                id="input-auth-username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. admin"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 pl-9 pr-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-300 uppercase tracking-wider mb-1.5">{isId ? 'Sandi Keamanan' : 'Security Password'}</label>
            <div className="relative">
              <Key size={14} className="absolute left-3 top-2.5 text-zinc-500" />
              <input
                id="input-auth-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 pl-9 pr-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-mono"
                required
              />
            </div>
          </div>

          <button
            id="btn-auth-submit"
            type="submit"
            disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-400 text-zinc-950 font-mono text-xs font-semibold py-2.5 rounded-md shadow-lg transition-colors duration-150 flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              isId ? 'Hubungkan Sesi Aman' : 'Establish Secure Session'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
