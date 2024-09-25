import * as Icons from '../../icons';

export interface SVGIconProps extends React.SVGAttributes<HTMLElement> {
  icon: string;
}

const Icon: React.FC<SVGIconProps> = ({
  icon = 'Chat',
  ...props
}) => {
  const SVG = (Icons as any)[icon];
  return <SVG {...props} />;
};

export default Icon;
