import styles from './HeaderMaskFrame.module.css';

const HeaderMaskFrame = ({ children }) => {
  return (
    <div style={{ zIndex: '0', position: 'relative' }}>
        <div className={styles.maskFrameContentWrap}>{children}</div>
    </div>
  );
};

export default HeaderMaskFrame;
