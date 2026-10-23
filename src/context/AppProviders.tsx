import { useState, type ReactNode } from 'react';

import { LocalizationProvider } from '../features/localization/index';



interface AppProvidersProps {
	children: ReactNode;
}



function AppProviders({ children }: AppProvidersProps)
{
	return (
		<LocalizationProvider>
			{children}
		</LocalizationProvider>
	)
}



export { AppProviders };