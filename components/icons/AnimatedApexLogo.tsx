

import React from 'react';
import type { AnimationState } from '../../types';

interface AnimatedApexLogoProps extends React.SVGProps<SVGSVGElement> {
  animationState: AnimationState;
}

export const AnimatedApexLogo: React.FC<AnimatedApexLogoProps> = ({ animationState, ...props }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      {...props}
    >
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{ stopColor: 'rgba(79, 70, 229, 0.8)', stopOpacity: 1 }} />
          <stop offset="60%" style={{ stopColor: 'rgba(55, 48, 163, 0.4)', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'rgba(30, 27, 75, 0)', stopOpacity: 0 }} />
        </radialGradient>
      </defs>
      
      <style>{`
        .body { fill: #281c4b; }
        .eyes, .mouth-stroke { stroke: #99f6e4; transition: transform 0.2s ease; }
        .glow-circle {
          r: 48;
          fill: url(#glow);
          transform-origin: 50% 50%;
        }
        
        /* --- IDLE animations --- */
        @keyframes idle-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes idle-look-around {
          0%, 40%, 100% { transform: translateX(0); }
          50%, 60% { transform: translateX(-2px); } /* Look left */
          70%, 80% { transform: translateX(2px); } /* Look right */
        }
        @keyframes idle-blink {
          0%, 95%, 100% { transform: scaleY(1); }
          97.5% { transform: scaleY(0.1); }
        }
        @keyframes idle-smile {
          0%, 100% { transform: scaleY(1) translateY(0); }
          50% { transform: scaleY(1.05) translateY(-1px); }
        }
        .idle .body-group { animation: idle-float 6s ease-in-out infinite; }
        .idle .eyes { animation: idle-look-around 10s ease-in-out infinite; }
        .idle .eye-left, .idle .eye-right {
          animation: idle-blink 5s ease-in-out infinite;
          transform-origin: 50% 50%;
        }
        .idle .mouth {
          animation: idle-smile 7s ease-in-out infinite 1s;
          transform-origin: 50% 90%;
        }

        /* --- THINKING animations --- */
        @keyframes thinking-glow {
          0%, 100% { transform: scale(0.98); opacity: 0.8; }
          50% { transform: scale(1.02); opacity: 1; }
        }
        @keyframes thinking-subtle-move {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1px); }
        }
        .thinking .glow-circle { animation: thinking-glow 3s ease-in-out infinite; }
        .thinking .body-group { animation: thinking-subtle-move 5s ease-in-out infinite; }

        /* --- SPEAKING animations --- */
        @keyframes speaking-rock {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-2px) rotate(-1.5deg); }
          75% { transform: translateY(0px) rotate(1.5deg); }
        }
        @keyframes speaking-mouth-joyful {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.6); }
        }
        .speaking .body-group { animation: speaking-rock 1.8s ease-in-out infinite; transform-origin: 50% 50%; }
        .speaking .mouth { animation: speaking-mouth-joyful 0.4s ease-in-out infinite; transform-origin: 50% 90%; }
      `}</style>

      <circle cx="50" cy="50" r="48" className="glow-circle" />
      
      <g className={animationState}>
        <g className="body-group">
          <circle cx="50" cy="50" r="40" className="body" />
          
          <g className="eyes">
            <circle cx="38" cy="45" r="5" fill="#99f6e4" className="eye-left" />
            <circle cx="62" cy="45" r="5" fill="#99f6e4" className="eye-right" />
          </g>
          
          <g className="mouth">
            <path d="M 40 60 Q 50 70 60 60" strokeWidth="3" fill="none" className="mouth-stroke" />
          </g>
        </g>
      </g>
    </svg>
  );
};