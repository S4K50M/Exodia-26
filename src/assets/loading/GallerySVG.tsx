import type { SVGProps } from 'react'

export function GallerySVG(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="320"
      height="160"
      viewBox="0 0 320 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        className="loading-path"
        d="M38 54H94L104 40H216L226 54H282C291.941 54 300 62.0589 300 72V112C300 121.941 291.941 130 282 130H38C28.0589 130 20 121.941 20 112V72C20 62.0589 28.0589 54 38 54Z"
        stroke="#FFD581"
        strokeWidth="4"
        fill="none"
        pathLength="1"
      />
      <path
        className="loading-path"
        d="M160 114C181.539 114 199 96.5391 199 75C199 53.4609 181.539 36 160 36C138.461 36 121 53.4609 121 75C121 96.5391 138.461 114 160 114Z"
        stroke="#FFD581"
        strokeWidth="4"
        fill="none"
        pathLength="1"
      />
      <path
        className="loading-path"
        d="M160 98C172.703 98 183 87.7025 183 75C183 62.2975 172.703 52 160 52C147.297 52 137 62.2975 137 75C137 87.7025 147.297 98 160 98Z"
        stroke="#FFD581"
        strokeWidth="4"
        fill="none"
        pathLength="1"
      />
      <path
        className="loading-path"
        d="M88 68H104"
        stroke="#FFD581"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        pathLength="1"
      />
      <path
        className="loading-path"
        d="M84 146H236"
        stroke="#FFD581"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        pathLength="1"
      />
    </svg>
  )
}
