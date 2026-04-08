'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { signin } from './lib/api';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = await signin({ name, password });

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username || name);
        router.push('/dashboard');
      } else {
        setError(data.message || data.error || 'Token non recu depuis le serveur');
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Erreur de connexion au serveur'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-300">
      <form
        onSubmit={handleLogin}
        className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md space-y-6"
      >
        <div className="flex justify-center">
          <Image
            src="/images/logo1.png"
            alt="Logo Dashboard IoT"
            width={100}
            height={100}
            className="rounded-full"
          />
        </div>

        <h2 className="text-2xl font-bold text-center text-neutral-800">
          Dashboard IoT - Connexion
        </h2>

        <input
          type="text"
          placeholder="Nom d'utilisateur"
          className="w-full px-4 py-2 border border-neutral-300 text-neutral-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Mot de passe"
          className="w-full px-4 py-2 border border-neutral-300 text-neutral-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition"
        >
          Se connecter
        </button>
      </form>
    </div>
  );
}
