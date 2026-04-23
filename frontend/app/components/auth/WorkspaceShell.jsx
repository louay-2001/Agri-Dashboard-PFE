'use client';

import Link from 'next/link';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import ProtectedRoute from './ProtectedRoute';
import { Button } from '../ui/button';
import {
  AUTH_CHANGED_EVENT,
  clearAuthSession,
  getAuthSession,
  hardRedirect,
} from '../../lib/auth';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/agro', label: 'Hierarchy' },
  { href: '/devices', label: 'Devices' },
  { href: '/readings', label: 'Readings' },
];

const isActivePath = (pathname, href) => pathname === href || pathname.startsWith(`${href}/`);

export default function WorkspaceShell({ eyebrow, title, description, actions, children }) {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [session, setSession] = useState(() => getAuthSession());

  useEffect(() => {
    const syncSession = () => {
      setSession(getAuthSession());
    };

    syncSession();
    window.addEventListener('storage', syncSession);
    window.addEventListener(AUTH_CHANGED_EVENT, syncSession);

    return () => {
      window.removeEventListener('storage', syncSession);
      window.removeEventListener(AUTH_CHANGED_EVENT, syncSession);
    };
  }, []);

  const roleLabel = session?.role ? String(session.role).toUpperCase() : 'AUTH';
  const organizationLabel = session?.organizationId || 'No organization scope';

  const activeNav = useMemo(
    () => NAV_ITEMS.map((item) => ({ ...item, active: isActivePath(pathname, item.href) })),
    [pathname]
  );

  const handleLogout = () => {
    setIsLoggingOut(true);
    setSession(null);
    clearAuthSession({ notify: false });
    hardRedirect('/');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-100 px-4 py-6 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50 md:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">
                  Agritech Workspace
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
                  Connected Demo
                </h1>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  Navigate the protected agritech workspace and sign out cleanly when the demo is complete.
                </p>
              </div>

              <div className="flex flex-col items-start gap-3 text-sm lg:items-end">
                <div className="rounded-2xl bg-neutral-50 px-4 py-3 dark:bg-neutral-800">
                  <p className="font-medium text-neutral-800 dark:text-neutral-100">
                    {session?.email || 'Authenticated user'}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                    {roleLabel}
                  </p>
                  <p className="mt-2 max-w-xs break-all text-xs text-neutral-500 dark:text-neutral-400">
                    Org: {organizationLabel}
                  </p>
                </div>
                <Button type="button" variant="destructive" onClick={handleLogout} disabled={isLoggingOut}>
                  {isLoggingOut ? 'Signing out...' : 'Logout'}
                </Button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {activeNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    item.active
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'border border-neutral-300 text-neutral-700 hover:border-emerald-500 hover:text-emerald-700 dark:border-neutral-700 dark:text-neutral-200 dark:hover:border-emerald-500 dark:hover:text-emerald-300'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </section>

          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">
                {eyebrow}
              </p>
              <h2 className="mt-2 text-4xl font-semibold tracking-tight">{title}</h2>
              <p className="mt-3 max-w-3xl text-sm text-neutral-600 dark:text-neutral-400">
                {description}
              </p>
            </div>

            {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
          </header>

          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}

WorkspaceShell.propTypes = {
  eyebrow: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  actions: PropTypes.node,
  children: PropTypes.node.isRequired,
};

WorkspaceShell.defaultProps = {
  actions: null,
};
