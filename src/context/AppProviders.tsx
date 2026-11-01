import { type ReactNode } from 'react';

import { ThemeProvider } from '../features/theme/index';
import { LocalizationProvider } from '../features/localization/index';
import { ToastProvider } from '../components/ui/Toast/index';
import { AuthProvider } from '../features/auth/providers/AuthProvider';


interface AppProvidersProps
{
	children: ReactNode;
}



function AppProviders({ children }: AppProvidersProps)
{
	return (
		<ThemeProvider>
			<LocalizationProvider>
				<ToastProvider>
					<AuthProvider>{children}</AuthProvider>
				</ToastProvider>
			</LocalizationProvider>
		</ThemeProvider>
	)
}



export { AppProviders };
