import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react'

import { generateId } from '../utils/generateId'

import { ToastView } from '../components/ToastView/ToastView'



type ToastType = 'success' | 'error' | 'info' | 'warning'



interface ToastOptions
{
	type: ToastType;
	duration?: number;

	title: string;
	message?: string;
}

interface ToastItemData extends ToastOptions
{
	id: string;
	duration: number;
}

interface ToastContextValue
{
	showToast: (options: ToastOptions) => void;
	removeToast: (id: string) => void;
}

interface ToastProviderProps
{
	children: ReactNode;
}



const ToastContext = createContext<ToastContextValue | undefined>(undefined)

const DEFAULT_TOAST_DURATION = 3000



function ToastProvider({ children }: ToastProviderProps)
{
	const [toasts, setToasts] = useState<ToastItemData[]>([])
	
	const showToast = useCallback
	(
		(options: ToastOptions) =>
		{
			const id = generateId()
			const duration = options.duration ?? DEFAULT_TOAST_DURATION

			const newToast: ToastItemData = { id, duration, ...options }
			setToasts((previous) => [...previous, newToast])

			return id
		},
		[]
	)

	const removeToast = useCallback
	(
		(id: string) =>
		{
			setToasts((previous) => previous.filter((toast) => toast.id !== id))
		},
		[]
	)
	
	const value = useMemo<ToastContextValue>
	(
		() => ({ showToast, removeToast }),
		[showToast, removeToast]
	)



	return (
		<ToastContext.Provider value={value}>
			{children}
			<ToastView toasts={toasts} removeToast={removeToast}/>
		</ToastContext.Provider>
	)
}



export type { ToastType, ToastOptions, ToastItemData, ToastContextValue };

export { ToastContext, ToastProvider };