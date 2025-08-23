import { useTheme } from 'next-themes'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps): React.JSX.Element => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      style={{
        '--normal-bg': 'var(--popover)',
        '--normal-text': 'var(--popover-foreground)',
        '--normal-border': 'var(--border)',
        '--toast-z-index': '100',
        zIndex: 100
      } as React.CSSProperties}
      toastOptions={{
        style: {
          zIndex: 100
        }
      }}
      {...props}
    />
  )
}

export { Toaster }
