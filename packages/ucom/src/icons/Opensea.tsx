import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgOpensea = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    viewBox="0 0 800 800"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <defs>
      <path id="opensea_svg__a" d="M7.7 46.6h784.7v706.7H7.7z" />
    </defs>
    <path
      d="m522.1 618.3 31.2-26 36.4-36.4 202.7-57.2v52l-57.2 31.2-52 57.2-46.8 72.7-57.2 41.6H184.3l-72.8-26-62.4-57.2-31.2-62.4-10.2-72.7H200v36.4l20.8 26 36.4 20.8H361v-77.9h-98.7l36.4-52 31.2-62.4 15.6-52-5.2-67.6-20.8-62.4-57.2-140.3 103.9 26V72.6l31.2-26 31.2 31.2v72.7l72.8 57.2 62.4 72.7 31.2 62.4v62.4l-31.2 52-52 62.4-20.8 20.8h-62.4v77.9zM272.7 384.4l-41.6 77.9H49.2l176.7-275.4L272.7 322z"
      className="opensea_svg__st1"
    />
  </svg>
)
export default SvgOpensea
