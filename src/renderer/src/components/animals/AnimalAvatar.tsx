import { PawPrint } from 'lucide-react'
import type { ReactElement } from 'react'

interface Props {
  src?: string
  alt: string
  size?: 'sm' | 'md'
}

const sizeMap = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16'
} as const

export function AnimalAvatar({ src, alt, size = 'sm' }: Props): ReactElement {
  return (
    <div
      className={`relative ${sizeMap[size]} rounded-full bg-muted flex items-center justify-center overflow-hidden`}
    >
      {src ? (
        <img src={src} alt={alt} className="object-cover w-full h-full" />
      ) : (
        <PawPrint className="text-muted-foreground" />
      )}
    </div>
  )
}
