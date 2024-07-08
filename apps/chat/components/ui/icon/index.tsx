import { Icons } from "./icons"

interface IconProps {
  name: string
  size?: number
}

const Icon: React.FC<IconProps> = ({ name, size, ...props }) => {
  const DynamicIcon = Icons[name]

  if (!DynamicIcon) {
    console.warn(`Icon not found.`)
    return null
  }

  return (
    <div>
      <DynamicIcon size={size} {...props} />
    </div>
  )
}

export default Icon
