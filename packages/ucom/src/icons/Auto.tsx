import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgAuto = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1200 1200"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path d="M251.26 649.86h81.922l-39.828-174.27zM953.93 469.4c-40.535 0-56.09 60.984-56.09 136.19 0 75.227 16.262 136.18 56.09 136.18 39.805 0 56.074-60.949 56.074-136.18 0-75.215-15.551-136.19-56.074-136.19" />
    <path d="M1060.8 353.59h-900c-33.145 0-60 26.855-60 60v384c0 33.145 26.855 60 60 60h900c33.145 0 60-26.855 60-60v-384c0-33.145-26.855-60-60-60M365.46 791.11l-20.41-89.34H238.72l-21.59 89.34h-55.488l101.89-371.05h61.32l97.777 371.05zm155.11.516c-105.98 0-97.789-131.51-97.789-131.51l.004-236.35h52.812v235.37c0 75.457 29.074 79.98 41.172 80.027h7.586c12.098-.047 41.207-4.57 41.207-80.027l-.004-235.37h52.789v236.35c.012 0 8.207 131.51-97.777 131.51m256.59-4.239h-58.512v-310.84h-72.07v-52.789h201.36v52.79h-70.777zm176.8 5.184c-71.102 0-106.02-83.7-106.02-186.98 0-103.26 35.293-187 106.02-187 70.703 0 106.01 83.723 106.01 187 0 103.29-34.922 186.98-106.01 186.98" />
  </svg>
)
export default SvgAuto
