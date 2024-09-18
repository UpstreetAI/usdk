interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    size?: 'small' | 'medium' | 'large';
    variant?: 'primary' | 'secondary' | 'ghost';
    shadow?: boolean;
    active?: boolean;
    disabled?: boolean;
}
declare const Button: React.FC<ButtonProps>;

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: string;
    size?: 'small' | 'medium' | 'large';
    variant?: 'primary' | 'secondary' | 'ghost';
    shadow?: boolean;
    active?: boolean;
    disabled?: boolean;
}
declare const IconButton: React.FC<IconButtonProps>;

interface SVGIconProps extends React.SVGAttributes<HTMLElement> {
    icon: string;
}
declare const Icon: React.FC<SVGIconProps>;

export { Button, Icon, IconButton };
