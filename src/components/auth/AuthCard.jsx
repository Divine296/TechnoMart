// src/components/auth/AuthCard.jsx
import React, { useId } from 'react';
import PropTypes from 'prop-types';

const AuthCard = ({
  title,
  children,
  className = '',
  cardClassName = '',
  compact = false,
  ...rest
}) => {
  const headingId = useId();

  return (
    <section
      className={`w-full ${compact ? 'max-w-sm' : 'max-w-md'} mx-auto ${className}`.trim()}
      aria-labelledby={title ? headingId : undefined}
      {...rest}
    >
      <div
        className={`bg-white p-4 sm:p-6 ${compact ? 'rounded-lg' : 'rounded-xl'} shadow-lg ${cardClassName}`.trim()}
      >
        {title && (
          <h2 id={headingId} className="text-xl font-semibold mb-4">
            {title}
          </h2>
        )}
        {children}
      </div>
    </section>
  );
};

AuthCard.propTypes = {
  title: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
  cardClassName: PropTypes.string,
  compact: PropTypes.bool,
};

export default AuthCard;
