import { type SVGProps } from 'react'
import { Root as Radio, Item } from '@radix-ui/react-radio-group'
import { ChevronDownIcon } from '@radix-ui/react-icons'
import { CircleCheck, RotateCcw } from 'lucide-react'
import { IconDir } from '@/assets/custom/icon-dir'
import { IconLayoutCompact } from '@/assets/custom/icon-layout-compact'
import { IconLayoutDefault } from '@/assets/custom/icon-layout-default'
import { IconLayoutFull } from '@/assets/custom/icon-layout-full'
import { IconSidebarFloating } from '@/assets/custom/icon-sidebar-floating'
import { IconSidebarInset } from '@/assets/custom/icon-sidebar-inset'
import { IconSidebarSidebar } from '@/assets/custom/icon-sidebar-sidebar'
import { IconThemeDark } from '@/assets/custom/icon-theme-dark'
import { IconThemeLight } from '@/assets/custom/icon-theme-light'
import { IconThemeSystem } from '@/assets/custom/icon-theme-system'
import { fonts } from '@/config/fonts'
import { cn } from '@/lib/utils'
import { useDirection } from '@/context/direction-provider'
import { type Collapsible, useLayout } from '@/context/layout-provider'
import { useTheme } from '@/context/theme-provider'
import { useFont } from '@/context/font-provider'
import { Button, buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useSidebar } from '@/components/ui/sidebar'

function SectionTitle({
  title,
  showReset = false,
  onReset,
  resetAriaLabel,
}: {
  title: string
  showReset?: boolean
  onReset?: () => void
  resetAriaLabel?: string
}) {
  return (
    <div className='mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground'>
      {title}
      {showReset && onReset && (
        <Button
          type='button'
          size='icon'
          variant='secondary'
          className='size-4 rounded-full'
          onClick={onReset}
          aria-label={resetAriaLabel}
        >
          <RotateCcw className='size-3' />
        </Button>
      )}
    </div>
  )
}

function RadioGroupItem({
  item,
  isTheme = false,
}: {
  item: {
    value: string
    label: string
    icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement
  }
  isTheme?: boolean
}) {
  return (
    <Item
      value={item.value}
      className={cn('group outline-none', 'transition duration-200 ease-in')}
      aria-label={`Select ${item.label.toLowerCase()}`}
      aria-describedby={`${item.value}-description`}
    >
      <div
        className={cn(
          'relative rounded-[6px] ring-[1px] ring-border',
          'group-data-[state=checked]:shadow-2xl group-data-[state=checked]:ring-primary',
          'group-focus-visible:ring-2'
        )}
        role='img'
        aria-hidden='false'
        aria-label={`${item.label} option preview`}
      >
        <CircleCheck
          className={cn(
            'size-6 fill-primary stroke-white',
            'group-data-[state=unchecked]:hidden',
            'absolute top-0 right-0 translate-x-1/2 -translate-y-1/2'
          )}
          aria-hidden='true'
        />
        <item.icon
          className={cn(
            !isTheme &&
              'fill-primary stroke-primary group-data-[state=unchecked]:fill-muted-foreground group-data-[state=unchecked]:stroke-muted-foreground'
          )}
          aria-hidden='true'
        />
      </div>
      <div
        className='mt-1 text-xs'
        id={`${item.value}-description`}
        aria-live='polite'
      >
        {item.label}
      </div>
    </Item>
  )
}

export function AppearanceForm() {
  const { font, setFont, resetFont } = useFont()
  const { defaultTheme, theme, setTheme, resetTheme } = useTheme()
  const { defaultDir, dir, setDir, resetDir } = useDirection()
  const { defaultVariant, variant, setVariant, collapsible, setCollapsible, resetLayout } = useLayout()
  const { open, setOpen } = useSidebar()

  const handleResetAll = () => {
    resetTheme()
    resetFont()
    resetDir()
    resetLayout()
    setOpen(true)
  }

  const radioState = open ? 'default' : collapsible

  return (
    <div className='space-y-8'>
      {/* Theme */}
      <div>
        <SectionTitle
          title='Theme'
          showReset={theme !== defaultTheme}
          onReset={() => setTheme(defaultTheme)}
          resetAriaLabel='Reset theme to default'
        />
        <Radio
          value={theme}
          onValueChange={setTheme}
          className='grid w-full max-w-md grid-cols-3 gap-4'
          aria-label='Select theme'
        >
          {[
            { value: 'system', label: 'System', icon: IconThemeSystem },
            { value: 'light', label: 'Light', icon: IconThemeLight },
            { value: 'dark', label: 'Dark', icon: IconThemeDark },
          ].map((item) => (
            <RadioGroupItem key={item.value} item={item} isTheme />
          ))}
        </Radio>
      </div>

      <Separator />

      {/* Font */}
      <div>
        <SectionTitle
          title='Font'
          showReset={font !== fonts[0]}
          onReset={resetFont}
          resetAriaLabel='Reset font to default'
        />
        <div className='relative w-max'>
          <select
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'w-50 appearance-none font-normal capitalize',
              'dark:bg-background dark:hover:bg-background'
            )}
            value={font}
            onChange={(e) => setFont(e.target.value as typeof font)}
          >
            {fonts.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <ChevronDownIcon className='absolute inset-e-3 top-2.5 h-4 w-4 opacity-50' />
        </div>
        <p className='mt-1 text-sm text-muted-foreground'>
          Set the font you want to use in the dashboard.
        </p>
      </div>

      <Separator />

      {/* Sidebar */}
      <div className='max-md:hidden'>
        <SectionTitle
          title='Sidebar'
          showReset={defaultVariant !== variant}
          onReset={() => setVariant(defaultVariant)}
          resetAriaLabel='Reset sidebar style to default'
        />
        <Radio
          value={variant}
          onValueChange={setVariant}
          className='grid w-full max-w-md grid-cols-3 gap-4'
          aria-label='Select sidebar style'
        >
          {[
            { value: 'inset', label: 'Inset', icon: IconSidebarInset },
            { value: 'floating', label: 'Floating', icon: IconSidebarFloating },
            { value: 'sidebar', label: 'Sidebar', icon: IconSidebarSidebar },
          ].map((item) => (
            <RadioGroupItem key={item.value} item={item} />
          ))}
        </Radio>
      </div>

      <Separator className='max-md:hidden' />

      {/* Layout */}
      <div className='max-md:hidden'>
        <SectionTitle
          title='Layout'
          showReset={radioState !== 'default'}
          onReset={() => {
            setOpen(true)
            resetLayout()
          }}
          resetAriaLabel='Reset layout to default'
        />
        <Radio
          value={radioState}
          onValueChange={(v) => {
            if (v === 'default') {
              setOpen(true)
              return
            }
            setOpen(false)
            setCollapsible(v as Collapsible)
          }}
          className='grid w-full max-w-md grid-cols-3 gap-4'
          aria-label='Select layout style'
        >
          {[
            { value: 'default', label: 'Default', icon: IconLayoutDefault },
            { value: 'icon', label: 'Compact', icon: IconLayoutCompact },
            { value: 'offcanvas', label: 'Full layout', icon: IconLayoutFull },
          ].map((item) => (
            <RadioGroupItem key={item.value} item={item} />
          ))}
        </Radio>
      </div>

      <Separator className='max-md:hidden' />

      {/* Direction */}
      <div>
        <SectionTitle
          title='Direction'
          showReset={defaultDir !== dir}
          onReset={() => setDir(defaultDir)}
          resetAriaLabel='Reset text direction to default'
        />
        <Radio
          value={dir}
          onValueChange={setDir}
          className='grid w-full max-w-md grid-cols-2 gap-4'
          aria-label='Select site direction'
        >
          {[
            {
              value: 'ltr',
              label: 'Left to Right',
              icon: (props: SVGProps<SVGSVGElement>) => (
                <IconDir dir='ltr' {...props} />
              ),
            },
            {
              value: 'rtl',
              label: 'Right to Left',
              icon: (props: SVGProps<SVGSVGElement>) => (
                <IconDir dir='rtl' {...props} />
              ),
            },
          ].map((item) => (
            <RadioGroupItem key={item.value} item={item} />
          ))}
        </Radio>
      </div>

      <Separator />

      <Button variant='destructive' onClick={handleResetAll}>
        <RotateCcw className='size-4' />
        Reset all settings
      </Button>
    </div>
  )
}