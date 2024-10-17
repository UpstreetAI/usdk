import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgIconCredits = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 20 26"
    fill="currentColor"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      d="M14.818 10.136a5.68 5.68 0 0 0-4.903-2.819 5.683 5.683 0 1 0 0 11.366 5.68 5.68 0 0 0 4.903-2.819h4.585a9.94 9.94 0 0 1-4.42 5.647V26h-3.966v-3.15c-.362.04-.729.065-1.102.065q-.559-.002-1.101-.064V26H4.847v-4.49C1.948 19.78 0 16.623 0 13s1.948-6.78 4.847-8.51V0h3.967v3.15c.362-.04.729-.065 1.101-.065q.56.002 1.102.064V0h3.966v4.49a9.94 9.94 0 0 1 4.42 5.646z"
      clipRule="evenodd"
    />
  </svg>
)
export default SvgIconCredits
