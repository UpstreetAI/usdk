import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgUnlock = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    data-name="Layer 1"
    viewBox="0 0 800 800"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d="m612.6 311.5-29.7-6.9v-41.8c0-100.8-82-182.9-182.9-182.9S243.7 136.3 222.9 217c-3.2 12.2 4.2 24.7 16.4 27.8 12.3 3.1 24.7-4.3 27.8-16.5 15.6-60.5 70.2-102.8 132.8-102.8S537 187 537 262.6v31.3l-123.9-28.6c-8.7-2.1-17.8-2.1-26.5 0l-199.3 45.9c-27 6.2-45.9 29.9-45.9 57.6v245.7c0 27.7 19 51.4 45.9 57.6L386.6 718c4.3 1.1 8.7 1.6 13.3 1.6s8.9-.5 13.3-1.6l199.3-45.9c27-6.2 45.9-29.9 45.9-57.6V368.8c0-27.7-19-51.4-45.9-57.6ZM445.7 514.3h-91.4c-12.6 0-22.9-10.3-22.9-22.9s10.3-22.9 22.9-22.9h91.4c12.6 0 22.9 10.3 22.9 22.9s-10.3 22.9-22.9 22.9"
      className="unlock_svg__cls-1"
    />
  </svg>
)
export default SvgUnlock
