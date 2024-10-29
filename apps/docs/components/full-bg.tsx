import Image from "next/image";

const FullBg = ({src, ...props}: {src: string}) => {
    return (
        <div className="w-full h-full fixed top-0 left-0 -z-10 animate-fd-fade-in">
            <Image alt="background image" src={src} height={500} width={1000} className="h-full w-full object-cover opacity-10 object-top" {...props} />
        </div>
    )
}

export default FullBg;