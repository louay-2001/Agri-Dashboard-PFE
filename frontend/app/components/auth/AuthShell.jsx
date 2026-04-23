'use client';

import PropTypes from 'prop-types';

export default function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
  sideEyebrow,
  sideTitle,
  sideDescription,
  sideContent,
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-100 via-white to-lime-100 px-4 py-10">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900">{title}</h1>
          <p className="mt-4 text-sm text-neutral-600">{description}</p>
          <div className="mt-6">{children}</div>
          {footer ? <div className="mt-6">{footer}</div> : null}
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-neutral-950 p-8 text-neutral-50 shadow-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">{sideEyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">{sideTitle}</h2>
          <p className="mt-4 text-sm text-neutral-300">{sideDescription}</p>
          <div className="mt-8">{sideContent}</div>
        </section>
      </div>
    </div>
  );
}

AuthShell.propTypes = {
  eyebrow: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  sideEyebrow: PropTypes.string.isRequired,
  sideTitle: PropTypes.string.isRequired,
  sideDescription: PropTypes.string.isRequired,
  sideContent: PropTypes.node.isRequired,
};

AuthShell.defaultProps = {
  footer: null,
};
