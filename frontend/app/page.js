'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthShell from './components/auth/AuthShell';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { getApiErrorMessage, signin } from './lib/api';
import { DEFAULT_AUTH_REDIRECT, getAuthSession, saveAuthSession } from './lib/auth';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const resolveRedirectTarget = (searchParams) => {
  const redirect = searchParams.get('redirect');
  return redirect && redirect.startsWith('/') ? redirect : DEFAULT_AUTH_REDIRECT;
};

const inputErrorClass = (message) => (message ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : '');

export default function LoginPage() {
  const router = useRouter();
  const [redirectTarget, setRedirectTarget] = useState(DEFAULT_AUTH_REDIRECT);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const nextRedirectTarget = resolveRedirectTarget(searchParams);
    const session = getAuthSession();

    setRedirectTarget(nextRedirectTarget);
    setFeedback({
      type: searchParams.get('reason') === 'session-expired' ? 'info' : '',
      text: searchParams.get('reason') === 'session-expired'
        ? 'Your session expired. Please sign in again.'
        : '',
    });

    if (session?.token) {
      router.replace(nextRedirectTarget);
      return;
    }

    setCheckingSession(false);
  }, [router]);

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!emailPattern.test(formData.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required.';
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentValue) => ({
      ...currentValue,
      [name]: value,
    }));
    setFormErrors((currentValue) => ({
      ...currentValue,
      [name]: '',
    }));
    setFeedback({ type: '', text: '' });
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      setFeedback({
        type: 'error',
        text: 'Please correct the highlighted login fields.',
      });
      return;
    }

    setSubmitting(true);
    setFeedback({ type: '', text: '' });

    try {
      const response = await signin({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (!response?.token) {
        setFeedback({
          type: 'error',
          text: 'The server did not return a JWT token.',
        });
        return;
      }

      saveAuthSession(response);
      router.replace(redirectTarget);
    } catch (error) {
      setFeedback({
        type: 'error',
        text: getApiErrorMessage(error, 'Unable to sign in with the provided credentials.'),
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingSession) {
    return (
      <AuthShell
        eyebrow="Agritech Auth"
        title="Checking session"
        description="Preparing your local auth session before loading the app."
        sideEyebrow="Demo Access"
        sideTitle="JWT-backed agritech workspace"
        sideDescription="This frontend uses the auth-service JWT to reach the protected agritech backend through the API gateway."
        sideContent={(
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            <p className="font-medium">Local development note</p>
            <p className="mt-2">
              The login page automatically redirects authenticated users into the protected workspace.
            </p>
          </div>
        )}
      >
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-600">
          Validating your current session.
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Agritech IoT"
      title="Sign In"
      description="Sign in with your tenant-scoped account to access the protected agritech routes and monitoring tools."
      sideEyebrow="Demo Access"
      sideTitle="JWT-backed agritech workspace"
      sideDescription="This frontend now uses the auth-service JWT to reach the protected agritech backend through the API gateway."
      footer={(
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link
            href={`/register?redirect=${encodeURIComponent(redirectTarget)}`}
            className="font-medium text-emerald-700 transition hover:text-emerald-800"
          >
            Create a multi-tenant account
          </Link>
          <span className="text-neutral-500">
            Protected routes: <span className="font-medium text-neutral-700">/dashboard, /agro, /devices, /readings</span>
          </span>
        </div>
      )}
      sideContent={(
        <>
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-emerald-100 p-3">
              <Image
                src="/images/logo1.png"
                alt="Agritech IoT"
                width={72}
                height={72}
                className="rounded-xl"
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-neutral-400">Workspace scope</p>
              <p className="mt-2 text-lg font-semibold">Hierarchy, devices, and monitoring</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-neutral-400">Hierarchy</p>
              <p className="mt-3 text-lg font-semibold">Organizations, farms, fields</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-neutral-400">Devices</p>
              <p className="mt-3 text-lg font-semibold">Managed per organization</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-neutral-400">Monitoring</p>
              <p className="mt-3 text-lg font-semibold">Latest readings and history</p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            <p className="font-medium">Local development note</p>
            <p className="mt-2">
              The JWT is stored in local browser storage for this local setup so the app can attach it to gateway requests without changing the backend cookie strategy.
            </p>
          </div>
        </>
      )}
    >
      {feedback.text ? (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${
          feedback.type === 'error'
            ? 'border-red-200 bg-red-50 text-red-700'
            : 'border-blue-200 bg-blue-50 text-blue-700'
        }`}>
          {feedback.text}
        </div>
      ) : null}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="admin@example.com"
            autoComplete="email"
            className={inputErrorClass(formErrors.email)}
          />
          {formErrors.email ? (
            <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="current-password"
            className={inputErrorClass(formErrors.password)}
          />
          {formErrors.password ? (
            <p className="mt-1 text-xs text-red-600">{formErrors.password}</p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </AuthShell>
  );
}
