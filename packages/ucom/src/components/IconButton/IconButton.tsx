import React, { forwardRef } from 'react';
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
  target?: string;
  href?: string;
}

const IconButton: React.FC<IconButtonProps> = forwardRef<HTMLButtonElement, IconButtonProps>(({
  icon = 'Accessories',
  size = 'small',
  variant = 'primary',
  shadow = false,
  active = false,
  disabled = false,
  label,
  target,
  href,
  ...props
}, ref) => {
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
          target={target}
        >
          <Icon icon={icon} />
        </a>
        {label && <div className={`${styles.label} font-bold text-stroke`}>{label}</div>}
      </div>
    );
  }

  return (
    <div className='relative'>
      <button
        ref={ref}
        className={className}
        disabled={disabled}
        {...props}
      >
        <Icon icon={icon} />
      </button>
      { /* TODO: Figure out why the <button> and the <a> tag show different height, therefore label top: is not the same */ }
      {label && <div className={`${styles.label} ${styles.buttonLabel} font-bold text-stroke`}>{label}</div>}
    </div>
  );
});

export default IconButton;
