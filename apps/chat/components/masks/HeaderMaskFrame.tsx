import styles from './HeaderMaskFrame.module.css';

const HeaderMaskFrame = ({ children }: any) => {
  return (
    <div style={{ zIndex: '0', position: 'absolute' }} className="w-full">
        <div className={styles.maskFrameContentWrap}>{children}</div>
        <div className={styles.maskFrameOverlay} />
    </div>
  );
};

export default HeaderMaskFrame;
