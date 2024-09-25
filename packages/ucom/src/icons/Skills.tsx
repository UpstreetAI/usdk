import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgSkills = ({
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
      d="m374.3 529.7-57.6 32.9-20.4 5.5-30.9-6.4-64.1-32.1 1 33.9-9.1 35.7-14.6 6.4 117.8 38.5 106.3-43.9-22-23.8z"
      className="skills_svg__cls-1"
    />
    <path
      d="m197.6 358.7-38.4 49.5 14.6 32.9 24.7 49.3 33.8 33 45.7 23.8 18.1 4.5 7.5-1.7 46.6-27.2 31.1-29.6 18.3-35.7 24.7-60.3-27.4-49.4-24.7-27.4-33.8 21.2-89.6 44.8 16.5-65.1z"
      className="skills_svg__cls-1"
    />
    <path
      d="M723.4 238.3V120.9L606 135v30.6L480.9 265.7l-1.6-7.6-16.5-32.9-25.6-44.9-36.5-33.8-53.1-25-68.6-.6-59.4 3.7-58.6 41.1-47.6 49.4-21.1 59.4-9.1 35.7 16.5 72-6.9 52.4 24.4-11.9 29.3 59.4 21.9-1c1.5-1.1-30.2-74.1-30.2-74.1l54.3-70.3 86.5-41.1-1.8 38.4-6.5 24.8 56.7-31.9 42-33.2 43.9 43 32.9 62.1-27.2 68.9-.3.6 187.2 122.1v39.4l117.4 14.1V526.5l-117.4 14.1v26.7L447.3 463.9l26.2-59.7 18.5 3.7-1.8-14.1 115.7-3.6v50.7l117.4-14v-89.2l-117.4-14v46.8l-118.1 3.7-.7-5.7 4-52.1-5.9-29 120.7-96.6V224l117.4 14.1Z"
      className="skills_svg__cls-1"
    />
  </svg>
)
export default SvgSkills
