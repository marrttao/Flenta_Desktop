import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom'

import { useAuth } from '../providers/authContext';



interface ProtectedRouteProps
{
	children: ReactNode;
	redirectTo?: string;
}



function ProtectedRoute({ children, redirectTo = '/auth/sign-in' }: ProtectedRouteProps)
{
	const { user } = useAuth();
	
	if (!user) { return <Navigate to={redirectTo} replace/> }

	return <>{children}</>
}



export type { ProtectedRouteProps };

export { ProtectedRoute };