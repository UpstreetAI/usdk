import styles from './HeaderMaskFrame.module.css';

const HeaderMaskFrame = ({ children, background, backgroundOpacity = 1, wrapperClass = '' }: any) => {
  return (
    <div className={`relative w-full ${wrapperClass}`}>
      <div 
        className="w-full h-full absolute top-0 left-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: '0',
          opacity: backgroundOpacity,
        }} 
      />
      <div className={styles.maskFrameOverlay} />
      <div className={styles.maskFrameContentWrap}>{children}</div>
    </div>
  );
};

export default HeaderMaskFrame;
