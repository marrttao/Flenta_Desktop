import type { ReactNode } from 'react'

export type IconName =
  | 'home' | 'card' | 'transfer' | 'exchange' | 'help' | 'settings' | 'shield' | 'search' | 'plus' | 'arrow'
  | 'wallet' | 'statement' | 'savings' | 'close' | 'refresh' | 'logout' | 'purchase' | 'bell' | 'gear'
  | 'snowflake' | 'eye' | 'lock' | 'user' | 'device' | 'alert' | 'swap' | 'chart' | 'phone' | 'globe' | 'check'

const paths: Record<IconName, ReactNode> = {
  home: <><path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/></>,
  card: <><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 10h18M7 15h4"/></>,
  transfer: <><path d="M4 8h15m-4-4 4 4-4 4M20 16H5m4-4-4 4 4 4"/></>,
  exchange: <><path d="M3 7h17m-4-4 4 4-4 4M21 17H4m4-4-4 4 4 4"/></>,
  help: <><rect x="3" y="3" width="18" height="15" rx="3"/><path d="m7 18-2 4M7 8h10M7 12h7"/></>,
  settings: <><path d="m9 3 1-1h4l1 3 3 1 3 3-1 3 1 3-3 3-3 1-1 3h-4l-1-3-3-1-3-3 1-3-1-3 3-3Z"/><circle cx="12" cy="12" r="3"/></>,
  gear: <><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7 7 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z"/></>,
  shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9S4 17 4 12V6Z"/><path d="m8 12 3 3 5-6"/></>,
  search: <><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></>,
  plus: <path d="M12 4v16M4 12h16"/>,
  arrow: <path d="m9 5 7 7-7 7"/>,
  wallet: <><rect x="3" y="5" width="18" height="15" rx="3"/><path d="M17 10h4v5h-5v-5h1M7 5V3h11v2"/></>,
  statement: <><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 7h8M8 11h8M8 15h6"/></>,
  savings: <><path d="M5 8c-4 2-4 9 1 11v3h3v-2h7v2h3v-4l3-3v-4h-3l-2-5-4 2H8L5 5ZM9 12h4"/><circle cx="16" cy="12" r=".5"/></>,
  close: <path d="m5 5 14 14M5 19 19 5"/>,
  refresh: <><path d="M20 8a8 8 0 1 0 0 8M20 3v5h-5"/></>,
  logout: <><path d="M9 4H3v16h6M9 12h12m-5-5 5 5-5 5"/></>,
  purchase: <><path d="M3 4h3l3 12h10l3-9H7M10 21h.01M18 21h.01"/></>,
  bell: <><path d="M6 9a6 6 0 1 1 12 0c0 5 2 7 2 7H4s2-2 2-7"/><path d="M10 20a2 2 0 0 0 4 0"/></>,
  snowflake: <><path d="M12 2v20M4 7l16 10M20 7 4 17"/><path d="m9 4 3 3 3-3M9 20l3-3 3 3"/></>,
  eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
  lock: <><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  device: <><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></>,
  alert: <><path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 17h.01"/></>,
  swap: <><path d="M4 8h14m-4-4 4 4-4 4M20 16H6m4-4-4 4 4 4"/></>,
  chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
  phone: <><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></>,
  globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></>,
  check: <path d="m5 12 5 5 9-10"/>,
}

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
