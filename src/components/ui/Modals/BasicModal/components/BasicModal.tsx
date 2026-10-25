import { useCallback, useEffect, useRef, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useTranslation } from '../../../../../features/localization/index';

import styles from './BasicModal.module.css';



const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';



type ModalSize = 'small' | 'medium' | 'large';

interface BasicModalProps
{
	isOpen: boolean;
	closeOnBackdropClick?: boolean;
	closeOnEscapeClick?: boolean;
	showCloseButton?: boolean;

	size?: ModalSize;

	title?: string;
	children?: ReactNode;
	footer?: ReactNode;

	onClose?: () => void;
}




function BasicModal({ isOpen, closeOnBackdropClick = true, closeOnEscapeClick = true, showCloseButton = true, size = 'medium', title, children, footer, onClose }: BasicModalProps)
{
	const { translate } = useTranslation();

	const dialogRef = useRef<HTMLDivElement>(null);
	const lastFocusedElementRef = useRef<HTMLElement | null>(null);



	const handleClicks = useCallback
	(
		(event: KeyboardEvent) =>
		{
			if (event.key === 'Escape' && closeOnEscapeClick)
			{
				event.preventDefault();
				event.stopPropagation();
				onClose?.();

				return;
			}

			if (event.key === 'Tab' && dialogRef.current)
			{
				const focusableElements = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((element) => element.offsetParent !== null && !element.hasAttribute('disabled'));
				if (focusableElements.length === 0) { return; }

				const firstElement = focusableElements[0];
				const lastElement = focusableElements[focusableElements.length - 1];
				
				const activeElement = document.activeElement as HTMLElement | null;

				if (event.shiftKey && activeElement === firstElement)
				{
					event.preventDefault();
					lastElement.focus();
				}
				else if (!event.shiftKey && activeElement === lastElement)
				{
					event.preventDefault();
					firstElement.focus();
				}
			}
		},
		[closeOnEscapeClick, onClose]
	);

	useEffect
	(
		() =>
		{
			if (!isOpen) { return; }

			lastFocusedElementRef.current = document.activeElement as HTMLElement | null;
			
			const previousOverflow = document.body.style.overflow;
			document.body.style.overflow = 'hidden';

			document.addEventListener('keydown', handleClicks);

			const focusTimer = setTimeout
			(
				() =>
				{
					const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
					(focusableElements && focusableElements.length > 0) ? focusableElements[0].focus() : dialogRef.current?.focus();
				},
				0
			)

			return () =>
			{
				clearTimeout(focusTimer);

				document.body.style.overflow = previousOverflow;

				document.removeEventListener('keydown', handleClicks);

				if (lastFocusedElementRef.current instanceof HTMLElement) { lastFocusedElementRef.current.focus();}
			}
		},
		[isOpen, handleClicks]
	);

	if (!isOpen) { return null; }

	const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) =>
	{
		if (closeOnBackdropClick && event.target === event.currentTarget) { onClose?.(); }
	}

	return createPortal
	(
		(
			<div className={styles.backdrop} onClick={handleBackdropClick}>
				<div ref={dialogRef} className={`${styles.dialog} ${styles[size]}`} tabIndex={-1}>
					{
						(title || showCloseButton) &&
						(
							<header className={styles.header}>
								{title && <h2 className={styles.title}>{title}</h2>}
								{showCloseButton && <button className={styles.close_button} onClick={onClose} aria-label={translate('common.close')}/>}
							</header>
						)
					}

					<div className={styles.body}>{children}</div>

					{footer && <footer className={styles.footer}>{footer}</footer>}
				</div>
			</div>
		),
		document.body
	)
}



export type { ModalSize, BasicModalProps };

export { BasicModal };