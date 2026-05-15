'use client';

import {
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type Ref,
  createElement,
  forwardRef,
  useEffect,
  useRef,
} from 'react';

type CssDoodleElement = HTMLElement & {
  update?: () => void;
};

type BlossomDoodleProps = {
  shapeFrequency?: number;
};

type CssDoodleProps = {
  className: string;
  ref: Ref<CssDoodleElement>;
  suppressHydrationWarning: boolean;
  use: string;
};

type BannerTextAnimationStyle = CSSProperties & {
  '--yonsei-banner-text-delay': string;
};

type BannerTextAnimationProps = HTMLAttributes<HTMLSpanElement> & {
  delaySeconds: number;
};

const BlossomDoodle = forwardRef<CssDoodleElement, BlossomDoodleProps>(
  function BlossomDoodle({ shapeFrequency = 0.4 }, ref) {
    useEffect(() => {
      void import('css-doodle');
    }, []);

    return (
      <div className="yonsei-blossom-doodle-container">
        <style>
          {`
          css-doodle {
            --randomColor: @p(#ea3323, #007cf3, #1fb254, #ffbb25);
            --rule: (
              overflow: hidden;
              
              :before {
                content: '';
                @size: 100%;
                position: absolute;
              }
              
              @random(${shapeFrequency}) {
                @random {
                  border-radius: 0px 0px 100% 100%;
                  background: linear-gradient(90deg, var(--randomColor) 50%, var(--randomColor) 50%);
                  
                  :before {
                    top: -50%;
                    left: 0;

                    background-color: #fffdfa;
                    @shape: hypocycloid 4;

                    -webkit-transition: ease @rand(200ms, 600ms);
                    transition: ease @rand(200ms, 600ms);
                  }
                }
                
                @random { 
                  border-radius: 100% 100% 0 0;
                  background: linear-gradient(90deg, var(--randomColor) 50%, var(--randomColor) 50%);
                  
                  :before {
                    top: 50%;
                    left: 0;
                    background-color: #fffdfa;

                    @shape: hypocycloid 4;
                    -webkit-transition: ease @rand(200ms, 600ms);
                    transition: ease @rand(200ms, 600ms);
                  }
                } 

                @random {
                background: none;

                -webkit-clip-path: @pick(circle(50% at 50% 50%), polygon(0 0, 100% 0, 100% 100%, 0% 100%));
                clip-path: @pick(circle(50% at 50% 50%), polygon(0 0, 100% 0, 100% 100%, 0% 100%));

                transform: rotate(@pick(0, 90deg, 180deg));
                -webkit-transition: ease @rand(200ms, 600ms);
                 
                transition: ease @rand(200ms, 600ms);
                
                :before {
                  background: linear-gradient(90deg, var(--randomColor) 50%, var(--randomColor) 50%);
                  top: 0;
                  left: 0;
                }
              }
            }
            );
          }
        `}
        </style>
        {createElement(
          'css-doodle',
          {
            className: 'yonsei-blossom-doodle',
            ref,
            suppressHydrationWarning: true,
            use: 'var(--rule)',
          } satisfies CssDoodleProps,
          `
          :doodle {
            @grid: 6x9;
            @size: 49.5% 80%;

            overflow: hidden;
            text-align:center;
            box-sizing:border-box;
          }
          
          :container {
            background: transparent;
            overflow:hidden;
          }
          `,
        )}
      </div>
    );
  },
);

export function YonseiBannerTextAnimation({
  children,
  className,
  delaySeconds,
  style,
  ...props
}: BannerTextAnimationProps) {
  return (
    <span
      className={
        className
          ? `yonsei-banner-text-animation ${className}`
          : 'yonsei-banner-text-animation'
      }
      style={
        {
          ...style,
          '--yonsei-banner-text-delay': `${delaySeconds}s`,
        } as BannerTextAnimationStyle
      }
      {...props}
    >
      {children}
    </span>
  );
}

export function YonseiDeveloperBannerDoodle() {
  const doodleRef = useRef<CssDoodleElement | null>(null);

  const updateDoodle = () => {
    doodleRef.current?.update?.();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    updateDoodle();
  };

  return (
    <aside className="developer-doodle-panel yonsei-developer-banner-panel">
      <button
        aria-label="GDGoC CNU 가치 그래픽 움직이기"
        className="developer-doodle-button yonsei-developer-banner-button"
        onClick={updateDoodle}
        onKeyDown={handleKeyDown}
        type="button"
      >
        <BlossomDoodle shapeFrequency={0.6} ref={doodleRef} />
      </button>
    </aside>
  );
}
