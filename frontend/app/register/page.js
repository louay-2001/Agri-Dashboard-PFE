'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthShell from '../components/auth/AuthShell';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { getApiErrorMessage, getPublicOrganizations, signin, signup } from '../lib/api';
import { DEFAULT_AUTH_REDIRECT, getAuthSession, saveAuthSession } from '../lib/auth';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPTY_ORGANIZATIONS_MESSAGE = 'Aucune organisation disponible. Veuillez contacter l\u2019administrateur.';
const ADMIN_ROLE = 'admin';

const resolveRedirectTarget = (searchParams) => {
  const redirect = searchParams.get('redirect');
  return redirect && redirect.startsWith('/') ? redirect : DEFAULT_AUTH_REDIRECT;
};

const inputErrorClass = (message) => (message ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : '');

export default function RegisterPage() {
  const router = useRouter();
  const [redirectTarget, setRedirectTarget] = useState(DEFAULT_AUTH_REDIRECT);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    organizationId: '',
    role: 'viewer',
  });
  const [formErrors, setFormErrors] = useState({});
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [organizationsLoading, setOrganizationsLoading] = useState(true);
  const [organizationsError, setOrganizationsError] = useState('');
  const requiresOrganization = formData.role !== ADMIN_ROLE;

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const nextRedirectTarget = resolveRedirectTarget(searchParams);
    const session = getAuthSession();

    setRedirectTarget(nextRedirectTarget);

    if (session?.token) {
      router.replace(nextRedirectTarget);
      return;
    }

    setCheckingSession(false);
  }, [router]);

  useEffect(() => {
    if (!requiresOrganization) {
      setOrganizationsLoading(false);
      setOrganizationsError('');
      setFormData((currentValue) => currentValue.organizationId
        ? { ...currentValue, organizationId: '' }
        : currentValue);
      setFormErrors((currentValue) => currentValue.organizationId
        ? { ...currentValue, organizationId: '' }
        : currentValue);
      return;
    }

    let active = true;

    const loadOrganizations = async () => {
      setOrganizationsLoading(true);
      setOrganizationsError('');

      try {
        const organizationItems = await getPublicOrganizations();

        if (!active) {
          return;
        }

        const nextOrganizations = Array.isArray(organizationItems) ? organizationItems : [];
        setOrganizations(nextOrganizations);
        setFormData((currentValue) => ({
          ...currentValue,
          organizationId: nextOrganizations.some((organization) => organization.id === currentValue.organizationId)
            ? currentValue.organizationId
            : '',
        }));
      } catch (error) {
        if (!active) {
          return;
        }

        setOrganizations([]);
        setOrganizationsError(getApiErrorMessage(error, 'Unable to load organizations.'));
      } finally {
        if (active) {
          setOrganizationsLoading(false);
        }
      }
    };

    void loadOrganizations();

    return () => {
      active = false;
    };
  }, [requiresOrganization]);

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!emailPattern.test(formData.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters long.';
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Confirm your password.';
    } else if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    if (requiresOrganization && !formData.organizationId) {
      nextErrors.organizationId = 'Select an organization.';
    }

    if (!formData.role) {
      nextErrors.role = 'Role is required.';
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

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      setFeedback({
        type: 'error',
        text: 'Please correct the highlighted registration fields.',
      });
      return;
    }

    setSubmitting(true);
    setFeedback({ type: '', text: '' });

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const signupPayload = {
      email,
      password,
      role: formData.role,
      ...(requiresOrganization ? { organizationId: formData.organizationId } : {}),
    };

    try {
      await signup(signupPayload);

      const loginResponse = await signin({
        email,
        password,
      });

      if (!loginResponse?.token) {
        setFeedback({
          type: 'success',
          text: 'Account created successfully. Sign in to continue.',
        });
        router.replace(`/?redirect=${encodeURIComponent(redirectTarget)}`);
        return;
      }

      saveAuthSession(loginResponse);
      router.replace(redirectTarget);
    } catch (error) {
      setFeedback({
        type: 'error',
        text: getApiErrorMessage(error, 'Unable to register this account.'),
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
        description="Preparing your local auth session before loading the registration form."
        sideEyebrow="Registration Notes"
        sideTitle="Tenant-aware accounts"
        sideDescription="New users are tied to an organization and role so the frontend and gateway can carry tenant context in the JWT."
        sideContent={(
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-neutral-200">
            Already authenticated users are redirected into the protected workspace automatically.
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
      eyebrow="Agritech Auth"
      title="Create Account"
      description="Register an admin directly, or choose an existing organization when signing up as a manager or viewer."
      sideEyebrow="Registration Notes"
      sideTitle="Tenant-aware accounts"
      sideDescription="Admins can register without an organization. Managers and viewers stay tied to an existing organization so tenant context still flows through the JWT."
      footer={(
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link
            href={`/?redirect=${encodeURIComponent(redirectTarget)}`}
            className="font-medium text-emerald-700 transition hover:text-emerald-800"
          >
            Already have an account? Sign in
          </Link>
          <span className="text-neutral-500">
            Roles supported: <span className="font-medium text-neutral-700">admin, manager, viewer</span>
          </span>
        </div>
      )}
      sideContent={(
        <>
          <div className="space-y-4 text-sm text-neutral-300">
            <p>
              Admin accounts can be created without an organization. Manager and viewer accounts still require an <span className="font-medium text-white">organizationId</span> plus a <span className="font-medium text-white">role</span>.
            </p>
            <p>
              When you switch back from admin to manager or viewer, the same page brings the organization selector back and requires a valid choice.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-neutral-400">Protected pages</p>
            <ul className="mt-4 space-y-2 text-sm text-neutral-200">
              <li>/dashboard</li>
              <li>/agro</li>
              <li>/devices</li>
              <li>/readings</li>
            </ul>
          </div>
        </>
      )}
    >
      {feedback.text ? (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${
          feedback.type === 'error'
            ? 'border-red-200 bg-red-50 text-red-700'
            : 'border-green-200 bg-green-50 text-green-700'
        }`}>
          {feedback.text}
        </div>
      ) : null}

      <form onSubmit={handleRegister} className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="manager@example.com"
            autoComplete="email"
            className={inputErrorClass(formErrors.email)}
          />
          {formErrors.email ? <p className="mt-1 text-xs text-red-600">{formErrors.email}</p> : null}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
            autoComplete="new-password"
            className={inputErrorClass(formErrors.password)}
          />
          {formErrors.password ? <p className="mt-1 text-xs text-red-600">{formErrors.password}</p> : null}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat your password"
            autoComplete="new-password"
            className={inputErrorClass(formErrors.confirmPassword)}
          />
          {formErrors.confirmPassword ? <p className="mt-1 text-xs text-red-600">{formErrors.confirmPassword}</p> : null}
        </div>

        <div>
          <Label htmlFor="role">Role</Label>
          <Select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={inputErrorClass(formErrors.role)}
          >
            <option value="admin">admin</option>
            <option value="manager">manager</option>
            <option value="viewer">viewer</option>
          </Select>
          {formErrors.role ? <p className="mt-1 text-xs text-red-600">{formErrors.role}</p> : null}
        </div>

        {requiresOrganization ? (
          <div>
            <Label htmlFor="organizationId">Organization</Label>
            <Select
              id="organizationId"
              name="organizationId"
              value={formData.organizationId}
              onChange={handleChange}
              disabled={organizationsLoading || submitting || !organizations.length}
              className={inputErrorClass(formErrors.organizationId)}
            >
              <option value="">
                {organizationsLoading
                  ? 'Loading organizations...'
                  : organizations.length
                    ? 'Select organization'
                    : 'No organization available'}
              </option>
              {organizations.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name}
                </option>
              ))}
            </Select>
            {formErrors.organizationId ? <p className="mt-1 text-xs text-red-600">{formErrors.organizationId}</p> : null}
            {!formErrors.organizationId && organizationsError ? <p className="mt-1 text-xs text-red-600">{organizationsError}</p> : null}
            {!formErrors.organizationId && !organizationsLoading && !organizationsError && !organizations.length ? (
              <p className="mt-1 text-xs text-amber-700">{EMPTY_ORGANIZATIONS_MESSAGE}</p>
            ) : null}
          </div>
        ) : null}

        <div className="md:col-span-2">
          <Button
            type="submit"
            className="w-full"
            disabled={submitting || (requiresOrganization && (organizationsLoading || !formData.organizationId || !organizations.length))}
          >
            {submitting ? 'Creating account...' : 'Register and Continue'}
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
