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
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.22),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(132,204,22,0.18),transparent_24%),linear-gradient(180deg,#f7fbf4_0%,#edf6ef_100%)] px-4 py-10 dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_20%),radial-gradient(circle_at_bottom_right,rgba(132,204,22,0.12),transparent_20%),linear-gradient(180deg,#08120f_0%,#0b1713_100%)]">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_1fr]">
        <section className="surface-card-strong animate-fade-up overflow-hidden rounded-[32px] p-8">
          <div className="absolute" />
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900">{title}</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-600">{description}</p>
          <div className="mt-6">{children}</div>
          {footer ? <div className="mt-6">{footer}</div> : null}
        </section>

        <section className="animate-fade-up animate-fade-up-delay-2 overflow-hidden rounded-[32px] border border-emerald-900/20 bg-[linear-gradient(180deg,rgba(8,18,14,0.96),rgba(11,32,24,0.98))] p-8 text-neutral-50 shadow-[0_28px_60px_rgba(2,12,10,0.32)]">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">{sideEyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">{sideTitle}</h2>
          <p className="mt-4 text-sm leading-6 text-neutral-300">{sideDescription}</p>
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
