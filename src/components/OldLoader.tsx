'use client';

import { useLayoutEffect, useRef, useEffect } from 'react';
import gsap from 'gsap';


export default function LoadingScreen({ onLoadingComplete }: { onLoadingComplete: () => void }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const callbackRef = useRef(onLoadingComplete);

    useEffect(() => {
        callbackRef.current = onLoadingComplete;
    }, [onLoadingComplete]);

    useLayoutEffect(() => {
        const paths = svgRef.current?.querySelectorAll('path');

        if (paths) {
            // 1️⃣ INITIAL SETUP: Transparent fill, white stroke, set up dashes
            gsap.set(paths, {
                fill: 'transparent',
                stroke: '#FFFFFF',
                strokeWidth: 2,
                strokeDasharray: (_i, target) => target.getTotalLength(),
                strokeDashoffset: (_i, target) => target.getTotalLength(),
            });

            // Make SVG visible after setup to prevent any micro-flash
            gsap.set(svgRef.current, { opacity: 1 });

            const tl = gsap.timeline({
                onComplete: () => callbackRef.current()
            });

            // Keep background black - we'll fade the entire container opacity instead

            // 2️⃣ TRACE ANIMATION: Draw the strokes
            tl.to(paths, {
                strokeDashoffset: 0,
                duration: 2.5,
                ease: 'power2.inOut',
                stagger: 0.2, // Draw one after another slightly
            }, 0) // Start at the same time
                // 3️⃣ FILL COLOR: Fade in the original fill colors
                .to(paths, {
                    fill: (_i, target) => target.getAttribute('data-original-color'), // Use data attribute for original color
                    stroke: 'transparent',
                    duration: 1,
                    ease: 'power2.out',
                })
                // 4️⃣ ZOOM & FADE: Scale up and fade out SVG
                .to(svgRef.current, {
                    scale: 5,
                    opacity: 0,
                    duration: 1.2,
                    ease: 'power4.in',
                }, '+=0.2') // Wait a bit after fill
                // 5️⃣ CONTAINER FADE: Fade out entire container smoothly
                .to(containerRef.current, {
                    opacity: 0,
                    duration: 0.8,
                    ease: 'power2.out',
                    onUpdate: function() {
                        // Disable pointer events when opacity is low enough
                        if (this.progress() > 0.5 && containerRef.current) {
                            containerRef.current.style.pointerEvents = 'none';
                        }
                    }
                }, '<0.5') // Start fading container before SVG fully fades
                // Call callback before fade completes so page is ready
                .call(() => {
                    if (containerRef.current) {
                        containerRef.current.style.pointerEvents = 'none';
                    }
                    callbackRef.current();
                }, [], '-=0.3'); // Call 0.3s before container fade completes
        }
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[9999] bg-black flex items-center justify-center h-screen w-screen pointer-events-auto"
            style={{ 
                pointerEvents: 'auto',
                zIndex: 9999,
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            }}
        >
            <svg
                ref={svgRef}
                width="240"
                height="241"
                viewBox="0 0 240 241"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M174.391 13.2573C175.849 13.9689 175.849 13.9689 177.337 14.6948C185.055 18.6552 191.677 23.8189 198.391 29.2573C198.92 29.6836 199.448 30.1099 199.993 30.5491C204.333 34.0952 207.812 37.9731 211.391 42.2573C212.02 42.9753 212.65 43.6933 213.298 44.4331C222.534 55.3372 229.716 68.7852 234.391 82.2573C234.634 82.9523 234.877 83.6472 235.127 84.3633C239.078 96.3132 239.887 108.089 239.954 120.57C239.963 121.279 239.971 121.988 239.98 122.718C240.071 133.448 238.423 142.98 235.391 153.257C235.151 154.102 234.91 154.946 234.662 155.816C229.885 171.858 221.836 186.999 210.391 199.257C209.886 199.803 209.381 200.349 208.861 200.912C190.192 220.916 168.94 231.873 142.391 238.257C141.294 238.524 140.197 238.791 139.067 239.066C109.873 244.97 77.6505 236.584 53.1165 220.448C48.6274 217.349 44.5075 213.826 40.3914 210.257C39.3097 209.401 38.2267 208.547 37.1414 207.695C17.427 190.221 2.62171 161.434 0.391416 135.257C-1.01765 110.693 1.02268 88.4548 12.3914 66.2573C12.8615 65.3355 12.8615 65.3355 13.3411 64.395C17.7667 55.8769 23.0992 48.4971 29.3914 41.2573C30.248 40.1759 31.1026 39.0929 31.9539 38.0073C40.4882 28.3789 51.3756 20.7662 62.5164 14.4448C63.1487 14.084 63.781 13.7233 64.4324 13.3516C72.9441 8.6527 81.6789 5.69923 91.1414 3.56982C92.0476 3.35777 92.9538 3.14572 93.8875 2.92724C121.28 -3.41101 149.409 0.77309 174.391 13.2573Z"
                    data-original-color="#010101"
                    fill="transparent"
                />
                <path
                    d="M93.3914 7.25732C92.774 7.59763 92.1565 7.93794 91.5203 8.28857C75.545 17.4312 66.5133 29.6495 61.3914 47.2573C57.6154 62.4342 61.2322 78.8168 68.5164 92.3472C77.5275 106.333 90.9765 115.886 107.239 119.866C112.144 120.758 117.136 120.758 122.108 120.887C139.449 121.441 153.206 129.541 165.031 141.755C176.128 154.003 179.267 170.146 178.575 186.114C177.264 201.415 168.063 215.854 156.579 225.57C151.553 229.393 146.286 232.036 140.391 234.257C139.77 234.518 139.149 234.778 138.51 235.046C131.79 237.637 125.407 237.719 118.266 237.632C117.067 237.623 115.867 237.613 114.631 237.604C105.858 237.455 97.8502 236.715 89.3914 234.257C87.5932 233.764 87.5932 233.764 85.7586 233.261C56.6338 224.475 31.3874 203.641 16.3914 177.257C1.88052 149.36 -2.5924 115.691 6.83283 85.4097C16.0528 57.9705 33.3709 36.1474 57.3914 20.2573C58.2087 19.694 59.026 19.1307 59.868 18.5503C67.7477 13.419 83.8136 4.17872 93.3914 7.25732Z"
                    data-original-color="#FDFDFD"
                    fill="transparent"
                />
                <path
                    d="M129.704 162.382C134.114 165.525 137.649 169.031 139.391 174.257C140.304 181.305 139.725 186.574 135.36 192.308C130.975 196.65 125.473 199.429 119.266 199.82C112.48 198.835 108.177 196.668 103.954 191.195C100.164 185.815 99.5484 180.714 100.391 174.257C102.655 168.619 106.485 164.702 111.391 161.257C117.506 159.295 124.091 159.059 129.704 162.382Z"
                    data-original-color="#050505"
                    fill="transparent"
                />
                <path
                    d="M127.579 44.9565C132.802 47.6242 135.579 51.821 137.391 57.2573C137.979 63.2551 136.69 67.3419 133.391 72.2573C129.176 76.3642 125.432 77.9852 119.641 78.7573C114.222 78.5931 110.282 75.8573 106.391 72.2573C103.634 68.5983 102.536 65.2719 101.891 60.7573C102.728 54.8985 104.859 50.1805 109.391 46.2573C114.747 42.8526 121.672 43.0684 127.579 44.9565Z"
                    data-original-color="#F8F8F8"
                    fill="transparent"
                />
            </svg>
        </div>
    );
}
