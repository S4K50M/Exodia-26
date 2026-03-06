import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './CustomCursor.css';

export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  
  const mousePos = useRef({ x: 0, y: 0 });
  const renderedPos = useRef({ x: 0, y: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });
  const targetDotOffset = useRef({ x: 0, y: 0 });
  const currentDotOffset = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>(0);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      // Smooth interpolation for the main cursor ring (lerp)
      renderedPos.current.x += (mousePos.current.x - renderedPos.current.x) * 0.2;
      renderedPos.current.y += (mousePos.current.y - renderedPos.current.y) * 0.2;

      // Calculate velocity for the dot shift
      const dx = mousePos.current.x - lastMousePos.current.x;
      const dy = mousePos.current.y - lastMousePos.current.y;
      
      const shiftLimit = 10;
      targetDotOffset.current = {
        x: Math.max(Math.min(dx * 0.5, shiftLimit), -shiftLimit),
        y: Math.max(Math.min(dy * 0.5, shiftLimit), -shiftLimit)
      };

      // Smoothly move the dot towards the target offset
      currentDotOffset.current.x += (targetDotOffset.current.x - currentDotOffset.current.x) * 0.15;
      currentDotOffset.current.y += (targetDotOffset.current.y - currentDotOffset.current.y) * 0.15;

      // Direct DOM manipulation for maximum performance
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${renderedPos.current.x}px, ${renderedPos.current.y}px, 0)`;
      }
      
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${currentDotOffset.current.x}px, ${currentDotOffset.current.y}px, 0)`;
      }

      // Return dot to center if movement stops
      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
        targetDotOffset.current = { x: 0, y: 0 };
      }

      lastMousePos.current = { ...mousePos.current };
      rafId.current = requestAnimationFrame(animate);
    };

    const handleHoverStart = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      if (cursorRef.current) {
        cursorRef.current.classList.add('hovering');
        if (target.dataset.cursor) {
          cursorRef.current.classList.add(`cursor-type-${target.dataset.cursor}`);
        }
      }
    };

    const handleHoverEnd = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      if (cursorRef.current) {
        cursorRef.current.classList.remove('hovering');
        if (target.dataset.cursor) {
          cursorRef.current.classList.remove(`cursor-type-${target.dataset.cursor}`);
        }
      }
    };

    const attachEventListeners = () => {
      const interactiveElements = document.querySelectorAll('a, button, .cursor-pointer, input, textarea, [role="button"], [data-cursor]');
      interactiveElements.forEach((el) => {
        el.addEventListener('mouseenter', handleHoverStart);
        el.addEventListener('mouseleave', handleHoverEnd);
      });
    };

    const observer = new MutationObserver(() => attachEventListeners());
    observer.observe(document.body, { childList: true, subtree: true });
    attachEventListeners();

    window.addEventListener('mousemove', onMouseMove);
    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      observer.disconnect();
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div ref={cursorRef} className="custom-cursor-container">
      <div className="custom-cursor-ring"></div>
      <div ref={dotRef} className="custom-cursor-dot"></div>
    </div>,
    document.body
  );
};
