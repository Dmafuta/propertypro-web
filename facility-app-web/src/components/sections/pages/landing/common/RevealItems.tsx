'use client';
import { useGSAP } from '@gsap/react';
import React, { ReactNode, useRef } from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface RevealItemsProps extends Record<string, unknown> {
  children: ReactNode;
  animateOnScroll?: boolean;
  delay?: number;
  duration?: number;
  stagger?: number;
  start?: string;
  ease?: string;
  y?: number;
  opacity?: boolean;
  sx?: SxProps<Theme>;
  component?: React.ElementType;
}

export default function RevealItems({
  children,
  animateOnScroll = true,
  delay = 0,
  duration = 0.8,
  stagger = 0.05,
  start = 'top 80%',
  ease = 'power2.out',
  y = 30,
  opacity = true,
  sx,
  component = Box,
  ...otherProps
}: RevealItemsProps) {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container?.children?.length) {
        return undefined;
      }

      const ctx = gsap.context(() => {
        const items = Array.from(container.children);

        const initialProps: gsap.TweenVars = {};
        if (opacity) initialProps.opacity = 0;
        if (y !== 0) initialProps.y = y;

        gsap.set(items, initialProps);

        const animationProps: gsap.TweenVars = {
          duration,
          ease,
          stagger,
          delay,
        };
        if (opacity) animationProps.opacity = 1;
        if (y !== 0) animationProps.y = 0;

        if (animateOnScroll) {
          gsap.to(items, {
            ...animationProps,
            scrollTrigger: {
              trigger: container,
              start,
              once: true,
            },
          });
        } else {
          gsap.to(items, animationProps);
        }

        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
        });
      }, container);

      return () => {
        ctx.revert();
      };
    },
    {
      scope: containerRef,
      dependencies: [animateOnScroll, delay, duration, stagger, start, ease, y, opacity],
    },
  );

  const Component = component;

  return (
    <Component ref={containerRef} sx={sx} {...otherProps}>
      {children}
    </Component>
  );
}
