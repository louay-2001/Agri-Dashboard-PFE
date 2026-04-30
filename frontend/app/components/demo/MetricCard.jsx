'use client';

import PropTypes from 'prop-types';

export default function MetricCard({ label, value, accent, helper, loading, animationDelayClass }) {
  return (
    <div className={`surface-card soft-card-hover animate-fade-up group relative overflow-hidden rounded-[28px] p-5 ${animationDelayClass}`}>
      <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent dark:via-emerald-500/40" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-500 dark:text-neutral-400">
            {label}
          </p>
          {loading ? (
            <>
              <div className="skeleton-block mt-3 h-9 w-20 rounded-2xl" />
              <div className="skeleton-block mt-3 h-4 w-28 rounded-full" />
            </>
          ) : (
            <>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
                {value}
              </p>
              {helper ? (
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                  {helper}
                </p>
              ) : null}
            </>
          )}
        </div>
        <span className={`mt-1 h-3.5 w-3.5 rounded-full shadow-[0_0_0_6px_rgba(255,255,255,0.72)] dark:shadow-[0_0_0_6px_rgba(10,18,15,0.72)] ${accent}`} aria-hidden="true" />
      </div>
    </div>
  );
}

MetricCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  accent: PropTypes.string,
  helper: PropTypes.string,
  loading: PropTypes.bool,
  animationDelayClass: PropTypes.string,
};

MetricCard.defaultProps = {
  accent: 'bg-green-500',
  helper: '',
  loading: false,
  animationDelayClass: '',
};
