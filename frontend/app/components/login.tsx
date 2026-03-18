'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signin, signup } from '../lib/api';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignup) {
        const signupData = await signup({ name, password });
        alert(JSON.stringify(signupData));
        setIsSignup(false);
        setError('Compte créé avec succès. Vous pouvez maintenant vous connecter.');
        return;
      }

      const data = await signin({ name, password });
      alert(JSON.stringify(data));

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username || name);
        router.push('/dashboard');
      } else {
        setError('Token non reçu depuis le serveur');
      }
    } catch (err: any) {
      alert(JSON.stringify(err?.response?.data || err.message || err));
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Erreur lors de la connexion'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border-4 border-red-500">
        <h2 className="text-3xl font-bold mb-6 text-center text-red-600">
          CONNEXION TEST LOUAY
        </h2>

        <p className="text-center text-green-600 font-bold mb-4">
          LOGIN VERSION TEST
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Nom</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-xl px-4 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Mot de passe</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-xl px-4 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className={error.includes('succès') ? 'text-green-600 text-sm' : 'text-red-500 text-sm'}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-xl py-2 hover:bg-blue-700 transition"
          >
            {isSignup ? 'Créer un compte' : 'Se connecter'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsSignup(!isSignup);
            setError('');
          }}
          className="w-full mt-4 text-blue-600 hover:underline"
        >
          {isSignup
            ? 'Vous avez déjà un compte ? Connectez-vous'
            : "Vous n'avez pas de compte ? Créez-en un"}
        </button>
      </div>
    </div>
  );
}