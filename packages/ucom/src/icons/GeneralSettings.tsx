import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgGeneralSettings = ({
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
      d="M760 289.3v58.9l-64.3 19.6-21.7 46.7 36.9 56.5-46.6 46.6-56.5-36.9-49.1 19.6-17.2 68.7-61.4-2.5-12.3-71.2-51.6-14.8-58.9 36.9-44.2-46.7 42.6-56.5-25.4-46.5-68.8-19.6v-56.5l66.3-17.2 24.6-46.7-36.9-61.4 44.2-41.8 56.5 34.4 46.7-17.2 14.8-71.2h63.9l17.2 68.7 41.8 19.6 73-34.4 45.7 41.8-47.5 61.4 17.2 41.8 71.2 19.7Zm-248-60.5c-49.6 0-89.9 40.3-89.9 89.9s40.3 89.9 89.9 89.9 89.9-40.3 89.9-89.9-40.2-89.9-89.9-89.9M268.4 519.4l22.5 35.7 46.8 11.2v46.8l-46.8 7.5-24.3 39.4 18.7 43-41.2 26.2-25.2-37.4h-53.4l-30 37.4-41.2-24.3 16.9-43-12.9-39.4-58.2-9.4v-46.8l58.3-6.8 12.9-41.9-16.9-45 41.2-22.5 30 33.7H219l23.4-35.6 43 24.3-17 46.8Zm-80.5 12.3c-31.6 0-57.1 30.8-57.1 57.2s25.6 57.1 57.1 57.1 57.1-25.6 57.1-57.1c0-26.3-25.5-57.2-57.1-57.2"
      className="generalSettings_svg__cls-1"
    />
  </svg>
)
export default SvgGeneralSettings
