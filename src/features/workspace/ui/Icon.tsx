import { iconPaths, logoMarkPaths, type IconName } from './iconPaths'

export type { IconName } from './iconPaths'

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {iconPaths[name].map((d, index) => <path key={index} d={d}/>)}
  </svg>
}

export function LogoMark({ className }: { className?: string }) {
  return <svg className={className} width="14" height="22" viewBox="0 0 13.916 22" fill="#4f3cfb" aria-hidden="true">
    {logoMarkPaths.map((d, index) => <path key={index} d={d}/>)}
  </svg>
}
