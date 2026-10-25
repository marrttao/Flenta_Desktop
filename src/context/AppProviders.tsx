import { type ReactNode } from 'react';

import { LocalizationProvider } from '../features/localization/index';
import { ToastProvider } from '../components/ui/Toast/index';
import { AuthProvider } from '../features/auth/components/AuthProvider.jsx';


interface AppProvidersProps {
	children: ReactNode;
}



function AppProviders({ children }: AppProvidersProps)
{
	return (
		<LocalizationProvider>
			<ToastProvider>
				<AuthProvider>{children}</AuthProvider>
			</ToastProvider>
		</LocalizationProvider>
	)
}



export { AppProviders };
