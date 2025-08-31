import React from 'react';

export const VideoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 5.2H2a.2.2 0 0 0-.2.2v13.2c0 .1.1.2.2.2h20a.2.2 0 0 0 .2-.2V5.4a.2.2 0 0 0-.2-.2zM7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5" />
  </svg>
);
