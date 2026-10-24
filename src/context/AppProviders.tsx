import { type ReactNode } from 'react';

import { LocalizationProvider } from '../features/localization/index';
import { ToastProvider } from '../components/ui/Toast/index';


interface AppProvidersProps {
	children: ReactNode;
}



function AppProviders({ children }: AppProvidersProps)
{
	return (
		<LocalizationProvider>
			<ToastProvider>
				{children}
			</ToastProvider>
		</LocalizationProvider>
	)
}



export { AppProviders };