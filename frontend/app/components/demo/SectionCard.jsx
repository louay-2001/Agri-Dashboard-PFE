'use client';

import PropTypes from 'prop-types';

export default function SectionCard({ title, subtitle, action, children, className, contentClassName }) {
  return (
    <section className={`surface-card soft-card-hover animate-fade-up overflow-hidden rounded-[30px] ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200/80 px-6 py-5 dark:border-neutral-800/80">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">{title}</h2>
          {subtitle ? (
            <p className="mt-1.5 max-w-3xl text-sm leading-6 text-neutral-500 dark:text-neutral-400">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className={`p-6 ${contentClassName}`}>{children}</div>
    </section>
  );
}

SectionCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  action: PropTypes.node,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  contentClassName: PropTypes.string,
};

SectionCard.defaultProps = {
  subtitle: '',
  action: null,
  className: '',
  contentClassName: '',
};
