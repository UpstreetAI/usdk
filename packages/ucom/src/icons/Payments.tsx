import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgPayments = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 35 31"
    fill="currentColor"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      d="M24.499 29.441a15.17 15.17 0 0 0 3.857-7.166H35v7.166zm1.994-18.346H35v7.126h-6.289c-.127-2.553-.92-4.98-2.218-7.126m-13.92-7.58c-.91 0-1.803.073-2.714.211V0H35v7.086H22.945a16.72 16.72 0 0 0-10.372-3.572M25.1 18.934C25.1 25.614 19.48 31 12.55 31S0 25.616 0 18.934C0 12.332 5.619 6.948 12.55 6.948c6.93 0 12.55 5.384 12.55 11.986M11.812 8.64h-3.29v3.558c-2.406 1.375-4.019 3.895-4.019 6.775s1.613 5.4 4.02 6.776v3.558h3.289v-2.5a8.7 8.7 0 0 0 1.827 0v2.5h3.288V25.75c1.746-.997 3.073-2.596 3.67-4.499h-3.802c-.818 1.34-2.334 2.24-4.07 2.24-2.602 0-4.712-2.022-4.712-4.517 0-2.494 2.11-4.517 4.712-4.517 1.736 0 3.252.9 4.07 2.24h3.803c-.598-1.902-1.925-3.5-3.67-4.498V8.641h-3.29v2.5a8.7 8.7 0 0 0-1.826 0z"
      clipRule="evenodd"
    />
  </svg>
)
export default SvgPayments
