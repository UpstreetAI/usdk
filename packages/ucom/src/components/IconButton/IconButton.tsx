import Icon from '../Icon';
import styles from './IconButton.module.css';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'ghost';
  shadow?: boolean;
  active?: boolean;
  disabled?: boolean;
  label?: string;
  href?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon = 'Accessories',
  size = 'small',
  variant = 'primary',
  shadow = false,
  active = false,
  disabled = false,
  label,
  href,
  ...props
}) => {
  const className = `
    ${styles.ucomIconButton} 
    ${size && styles[size]}
    ${variant && styles[variant]}
    ${shadow && variant !== 'ghost' && !active && styles.shadow}
    ${active && styles.active}
    ${props.className}
  `;

  if (href) {
    return (
      <div className='relative'>
        <a
          href={href}
          className={className}
        >
          <Icon icon={icon} />
        </a>
        {label && <div className={`${styles.label} font-[Aller-Bold]`}>{label}</div>}
      </div>
    );
  }

  return (
    <button
      className={className}
      disabled={disabled}
      {...props}
    >
      <Icon icon={icon} />
      {label && <div className={`${styles.label} absolute top-full w-full left-0 text-center font-[Aller-Bold]`}>{label}</div>}
    </button>
  );
};

export default IconButton;
