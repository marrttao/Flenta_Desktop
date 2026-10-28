import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { storageService, StorageKeys } from '../../../storage/index';

import { Theme, ResolvedTheme } from '../types';



interface ThemeContextValue
{
	theme: Theme;
	resolvedTheme: ResolvedTheme;

	setTheme: (theme: Theme) => void;
}

interface ThemeProviderProps
{
	children: ReactNode;
}



const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);



function getSystemTheme(): ResolvedTheme
{
	if (typeof window === 'undefined') { return 'light'; }
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function ThemeProvider({ children }: ThemeProviderProps)
{
	const [theme, setThemeState] = useState<Theme>
	(
		() =>
		{
			const stored = storageService.getItem<Theme>(StorageKeys.THEM)
			return stored ?? 'system';
		}
	);
	const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme());

	useEffect
	(
		() =>
		{
			const query = window.matchMedia('(prefers-color-scheme: dark)');
			const handleChange = () => setSystemTheme(getSystemTheme());
			
			query.addEventListener('change', handleChange);
			return () => query.removeEventListener('change', handleChange);
		},
		[]
	);

	const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme;

	useEffect
	(
		() => document.documentElement.setAttribute('data-theme', resolvedTheme),
		[resolvedTheme]
	);

	

	const setTheme = (newTheme: Theme) =>
	{
		storageService.setItem(StorageKeys.THEM, newTheme);
		setThemeState(newTheme);
	};

	const value = useMemo<ThemeContextValue>(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme]);



	return (
		<ThemeContext.Provider value={value}>
			{children}
		</ThemeContext.Provider>
	)
}



export type { ThemeContextValue, ThemeProviderProps };

export { ThemeContext, ThemeProvider };