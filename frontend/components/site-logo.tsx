import Image from 'next/image'
import { cn } from '@/lib/utils'

// A logo é um círculo sobre fundo branco: o recorte redondo tira os cantos.
export function SiteLogo({ size = 120, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="Última Fatia"
      width={size}
      height={size}
      priority
      className={cn('rounded-full', className)}
    />
  )
}
