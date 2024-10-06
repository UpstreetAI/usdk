import styles from './HeaderMaskFrame.module.css';

const HeaderMaskFrame = ({ children, background }: any) => {
  return (
    <div className="relative w-full">
      <div 
        className="w-full h-full absolute top-0 left-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: '0'
        }} 
      />
      <div className={styles.maskFrameOverlay} />
      <div className='relative z-2'>{children}</div>
    </div>
  );
};

export default HeaderMaskFrame;
