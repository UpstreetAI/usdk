import styles from './Button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'small' | 'medium' | 'large'; 
  variant?: 'primary' | 'secondary' | 'ghost';
  shadow?: boolean;
  active?: boolean;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
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
        `${styles.ucomButton} 
         ${size && styles[size]}
         ${variant && styles[variant]}
         ${shadow && variant !== 'ghost' && !active && styles.shadow}
         ${active && styles.active}
         ${props.className}`
      }
      {...props}
    >
      {props.children}
    </button>
  );
};

export default Button;
