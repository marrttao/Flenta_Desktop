import { useState, useEffect } from 'react';
import { useTranslation } from '../../../../../features/localization';

import type { ToastItemData } from '../../providers/ToastProvider';

import styles from './ToastItem.module.css';



interface ToastItemProps
{
	toast: ToastItemData;
	removeToast: (id: string) => void;
}



export function ToastItem({ toast, removeToast }: ToastItemProps)
{
	const { translate } = useTranslation()
	const [isExiting, setIsExiting] = useState(false)

	useEffect
	(
		() =>
		{
			if (toast.duration <= 0 || isExiting) { return; }

			const timeout = window.setTimeout(() => setIsExiting(true), toast.duration)

			return () =>
			{
				clearTimeout(timeout);
			}
		},
		[toast.duration, isExiting]
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
			<button type="button" className={styles.toast_close_button} aria-label={translate('common.close')} onClick={() => removeToast(toast.id)}/>
		</div>
	);
}
