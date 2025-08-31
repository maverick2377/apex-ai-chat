import React from 'react';

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"></path>
    <path d="M4.5 4.5L6 9L10.5 10.5L6 12L4.5 16.5L3 12L-1.5 10.5L3 9L4.5 4.5Z" transform="translate(13, 1)"></path>
    <path d="M19.5 19.5L18 15L13.5 13.5L18 12L19.5 7.5L21 12L25.5 13.5L21 15L19.5 19.5Z" transform="translate(-14, -1)"></path>
  </svg>
);