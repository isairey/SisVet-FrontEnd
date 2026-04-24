import clsx from 'clsx'

interface SpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap: Record<Required<SpinnerProps>['size'], string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-[3px]',
}

export const Spinner = ({ className, size = 'md' }: SpinnerProps) => (
  <span
    className={clsx(
      'inline-block animate-spin rounded-full border-solid border-white/30 border-t-white',
      sizeMap[size],
      className,
    )}
    role="status"
    aria-label="Cargando"
  />
)

