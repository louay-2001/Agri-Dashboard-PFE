'use client';

import PropTypes from 'prop-types';

export default function MetricCard({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-neutral-500 dark:text-neutral-400">
            {label}
          </p>
          <p className="mt-3 text-3xl font-semibold text-neutral-900 dark:text-neutral-50">
            {value}
          </p>
        </div>
        <span className={`h-3 w-3 rounded-full ${accent}`} aria-hidden="true" />
      </div>
    </div>
  );
}

MetricCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  accent: PropTypes.string,
};

MetricCard.defaultProps = {
  accent: 'bg-green-500',
};
