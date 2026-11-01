import { createPortal } from 'react-dom'

import type { ToastItemData } from '../../providers/ToastProvider'
import { ToastItem } from '../ToastItem/ToastItem'

import styles from './ToastView.module.css'



interface ToastViewProps
{
	toasts: ToastItemData[];

	removeToast: (id: string) => void;
}



function ToastView({ toasts, removeToast }: ToastViewProps)
{
	if (typeof document === 'undefined') { return null; }

	return createPortal
	(
		<div className={styles.toast_container}>
			{
				toasts.map
				(
					(toast) => <ToastItem key={toast.id} toast={toast} removeToast={removeToast}/>
				)
			}
		</div>,
		document.body
	);
}



export type { ToastViewProps };

export { ToastView };