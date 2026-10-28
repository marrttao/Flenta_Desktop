import { useCallback, useEffect, useId, useRef, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useTranslation } from '../../../../../features/localization/index';

import styles from './BasicModal.module.css';



const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(dialog: HTMLElement): HTMLElement[]
{
	return Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
		(element) => element.tabIndex >= 0 && !element.matches(':disabled') &&
			!element.closest('[inert]') && element.getClientRects().length > 0 &&
			getComputedStyle(element).visibility === 'visible'
	);
}



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
	const titleId = useId();



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
				const focusableElements = getFocusableElements(dialogRef.current);
				if (focusableElements.length === 0)
				{
					event.preventDefault();
					dialogRef.current.focus();
					return;
				}

				const firstElement = focusableElements[0];
				const lastElement = focusableElements[focusableElements.length - 1];
				
				const activeElement = document.activeElement as HTMLElement | null;

				if (event.shiftKey && (activeElement === firstElement || !focusableElements.includes(activeElement!)))
				{
					event.preventDefault();
					lastElement.focus();
				}
				else if (!event.shiftKey && (activeElement === lastElement || !focusableElements.includes(activeElement!)))
				{
					event.preventDefault();
					firstElement.focus();
				}
			}
		},
		[closeOnEscapeClick, onClose]
	);

	useEffect(() =>
	{
		if (!isOpen) { return; }
		document.addEventListener('keydown', handleClicks);
		return () => document.removeEventListener('keydown', handleClicks);
	}, [isOpen, handleClicks]);

	useEffect
	(
		() =>
		{
			if (!isOpen) { return; }

			lastFocusedElementRef.current = document.activeElement as HTMLElement | null;
			
			const previousOverflow = document.body.style.overflow;
			document.body.style.overflow = 'hidden';

			const focusTimer = setTimeout
			(
				() =>
				{
					const dialog = dialogRef.current;
					if (dialog) { (getFocusableElements(dialog)[0] ?? dialog).focus(); }
				},
				0
			)

			return () =>
			{
				clearTimeout(focusTimer);

				document.body.style.overflow = previousOverflow;

				if (lastFocusedElementRef.current instanceof HTMLElement) { lastFocusedElementRef.current.focus();}
			}
		},
		[isOpen]
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
				<div ref={dialogRef} className={`${styles.dialog} ${styles[size]}`} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={title ? titleId : undefined}>
					{
						(title || showCloseButton) &&
						(
							<header className={styles.header}>
								{title && <h2 id={titleId} className={styles.title}>{title}</h2>}
								{showCloseButton && <button type="button" className={styles.close_button} onClick={onClose} aria-label={translate('common.close')}/>}
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
