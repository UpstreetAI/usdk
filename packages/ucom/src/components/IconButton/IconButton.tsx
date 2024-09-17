import Icon from '../Icon';
import styles from './IconButton.module.css';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  size?: 'small' | 'medium' | 'large'; 
  variant?: 'primary' | 'secondary' | 'ghost';
  shadow?: boolean;
  active?: boolean;
  disabled?: boolean; 
}

const IconButton: React.FC<IconButtonProps> = ({
  icon = 'Accessories',
  size = 'small',
  variant = 'primary',
  shadow = false,
  active = false,
  disabled = false,
  ...props 
}) => {
  return (
    <button
      className={
        `${styles.ucomIconButton} 
         ${size && styles[size]}
         ${variant && styles[variant]}
         ${shadow && variant !== 'ghost' && !active && styles.shadow}
         ${active && styles.active}
         ${props.className}`
      }
      {...props}
    >
      <Icon icon={icon} />
    </button>
  );
};

export default IconButton;
