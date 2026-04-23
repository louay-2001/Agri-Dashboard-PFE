'use client';

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { usePathname } from 'next/navigation';
import { AUTH_CHANGED_EVENT, buildLoginHref, getAuthSession, hardRedirect } from '../../lib/auth';

export default function ProtectedRoute({ children }) {
  const pathname = usePathname();
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    const evaluateSession = () => {
      const session = getAuthSession();

      if (!session?.token) {
        setStatus('redirecting');
        hardRedirect(buildLoginHref(pathname));
        return;
      }

      setStatus('ready');
    };

    evaluateSession();

    window.addEventListener('storage', evaluateSession);
    window.addEventListener(AUTH_CHANGED_EVENT, evaluateSession);

    return () => {
      window.removeEventListener('storage', evaluateSession);
      window.removeEventListener(AUTH_CHANGED_EVENT, evaluateSession);
    };
  }, [pathname]);

  if (status !== 'ready') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-4 dark:bg-neutral-950">
        <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">
            Agritech Auth
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
            Checking session
          </h1>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
            {status === 'redirecting'
              ? 'Redirecting to login...'
              : 'Validating your local session before loading this page.'}
          </p>
        </div>
      </div>
    );
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
