import { CSSProperties } from 'react';

import { useTheme } from '../hooks/useTheme'

import { ThemeSwitcher } from '../components/ThemeSwitcher/ThemeSwitcher'



function ThemeTest()
{
	const { theme, resolvedTheme } = useTheme();
	
	  const vars: CSSProperties = {
		'--bg':           resolvedTheme === 'dark' ? '#111827' : '#f8fafc',
		'--text-heading': resolvedTheme === 'dark' ? '#fafafa' : '#0f172a',
		'--text':         resolvedTheme === 'dark' ? '#e5e7eb' : '#111827',
		'--border':       resolvedTheme === 'dark' ? '#3f3f46' : '#d4d4d8',
		'--input-bg':     resolvedTheme === 'dark' ? '#18181b' : '#ffffff',
		'--input-text':   resolvedTheme === 'dark' ? '#f4f4f5' : '#111827',
	} as CSSProperties


	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '12px', ...vars }}>
			<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
				<div>Current theme: <strong>{theme}</strong></div>
				<div>Resolved theme: <strong>{resolvedTheme}</strong></div>

				<ThemeSwitcher/>
			</div>

			<div style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border, #444)', backgroundColor: 'var(--bg, #111827)', color: 'var(--text, #e5e5e5)' }}>
				<h2 style={{ color: 'var(--text-heading, #000)' }}>Theme Test</h2>
				<p style={{ color: 'var(--text, #111827)' }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>

				<div style={{ padding: '16px', marginTop: '12px', borderRadius: '8px', border: '1px solid var(--border, #444)', backgroundColor: 'var(--input-bg, #222)', color: 'var(--input-text, #e5e5e5)'}}>
					<p>This block has a custom theme applied</p>
					<button type="button">Button</button>
				</div>
			</div>
		</div>
	)
}



export { ThemeTest };