import { useRef, useState, useEffect } from 'react';

import type { ToastItemData } from '../../providers/ToastProvider';

import styles from './ToastItem.module.css';



interface ToastItemProps
{
	toast: ToastItemData;
	removeToast: (id: string) => void;
}



export function ToastItem({ toast, removeToast }: ToastItemProps)
{
	const timeoutRef = useRef<number | null>(null)
	const [isExiting, setIsExiting] = useState(false)

	const handleClose = () => { setIsExiting(true); }
	
	useEffect
	(
		() =>
		{
			if (toast.duration <= 0 || isExiting) { return; }

			timeoutRef.current = window.setTimeout(handleClose, toast.duration)

			return () =>
			{
				if (timeoutRef.current !== null) { clearTimeout(timeoutRef.current); }
			}
		},
		[toast.duration, removeToast]
	);

	const handleExitingAnimation = () =>
	{
		if (isExiting) { removeToast(toast.id); }
	};

	return (
		<div className={`${styles.toast_item} ${styles[`toast_${toast.type}`]} ${isExiting ? styles.slide_out : ''}`} onAnimationEnd={handleExitingAnimation}>
			<div className={styles.toast_content}>
				<div className={styles.toast_title}>{toast.title}</div>
				{toast.message && <div className={styles.toast_message}>{toast.message}</div>}
			</div>
			<button type="button" className={styles.toast_close_button} onClick={() => removeToast(toast.id)}/>
		</div>
	);
}