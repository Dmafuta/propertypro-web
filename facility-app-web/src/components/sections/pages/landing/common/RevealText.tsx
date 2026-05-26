'use client';

import { useGSAP } from '@gsap/react';
import { Children, ElementType, JSX, ReactNode, cloneElement, useRef } from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText, ScrollTrigger);

interface RevealTextProps extends Record<string, unknown> {
  children: ReactNode;
  animateOnScroll?: boolean;
  delay?: number;
  duration?: number;
  stagger?: number;
  start?: string;
  ease?: string;
  reverse?: boolean;
  sx?: SxProps<Theme>;
  component?: ElementType;
}

export default function RevealText({
  children,
  animateOnScroll = true,
  delay = 0,
  duration = 0.8,
  stagger = 0.05,
  start = 'top 80%',
  ease = 'power4.out',
  reverse = false,
  sx,
  component = 'div',
  ...otherProps
}: RevealTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  const elementRef = useRef<HTMLElement[]>([]);
  const splitRef = useRef<SplitText[]>([]);
  const lines = useRef<HTMLElement[]>([]);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      splitRef.current = [];
      elementRef.current = [];
      lines.current = [];

      const elements: HTMLElement[] = containerRef.current.hasAttribute('data-copy-wrapper')
        ? (Array.from(containerRef.current.children) as HTMLElement[])
        : [containerRef.current];

      elements.forEach((element) => {
        elementRef.current.push(element);

        const split = SplitText.create(element, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'line++',
        });

        splitRef.current.push(split);

        const computedStyle = window.getComputedStyle(element);
        const textIndent = computedStyle.textIndent;

        if (textIndent && textIndent !== '0px') {
          if (split.lines && split.lines.length > 0) {
            (split.lines[0] as HTMLElement).style.paddingLeft = textIndent;
          }
          element.style.textIndent = '0';
        }

        if (split.lines) {
          lines.current.push(...(split.lines as HTMLElement[]));
        }
      });

      gsap.set(lines.current, { y: '100%' });

      const animationProps = {
        y: '0%',
        duration,
        stagger: reverse ? -stagger : stagger,
        ease,
        delay,
      };

      if (animateOnScroll) {
        gsap.to(lines.current, {
          ...animationProps,
          scrollTrigger: {
            trigger: containerRef.current,
            start,
            once: true,
          },
        });
      } else {
        gsap.to(lines.current, animationProps);
      }

      return () => {
        splitRef.current.forEach((split) => {
          if (split) {
            split.revert();
          }
        });
      };
    },
    {
      scope: containerRef,
      dependencies: [animateOnScroll, delay, duration, stagger, start, ease, reverse],
    },
  );

  if (Children.count(children) === 1 && component === Box) {
    const child = Children.only(children) as JSX.Element;

    return cloneElement(child, {
      ref: containerRef,
      sx: sx ? { ...(child.props.sx || {}), ...sx } : child.props.sx,
      ...otherProps,
    });
  }

  const Component = component;

  return (
    <Component ref={containerRef} data-copy-wrapper="true" sx={sx} {...otherProps}>
      {children}
    </Component>
  );
}
