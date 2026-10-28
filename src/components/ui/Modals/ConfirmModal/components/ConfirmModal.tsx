import { useTranslation } from '../../../../../features/localization/index';

import { BasicModal } from '../../BasicModal/index';

import styles from './ConfirmModal.module.css';



interface ConfirmModalProps
{
	isOpen: boolean;

	title?: string;
	message?: string;
	
	confirmText?: string;
	cancelText?: string;

	variant?: 'primary' | 'secondary' | 'danger';
	loading?: boolean;

	onClose?: () => void;
	onConfirm?: () => void;
}



function ConfirmModal({ isOpen, title, message, confirmText, cancelText, variant = 'primary', loading = false, onClose, onConfirm }: ConfirmModalProps)
{
	const { translate } = useTranslation()

	const variantClass = styles[`btn_${variant}`];

	return (
		<BasicModal isOpen={isOpen} onClose={onClose} title={title} size="small" showCloseButton={!loading} closeOnEscapeClick={!loading} closeOnBackdropClick={!loading}
			footer=
			{
				<>
					<button type="button" className={`${styles.btn} ${styles.btn_secondary}`} onClick={onClose} disabled={loading}>{cancelText ?? translate('common.cancel')}</button>
					<button type="button" className={`${styles.btn} ${variantClass}`} onClick={onConfirm} disabled={loading}>{confirmText ?? translate('common.confirm')}</button>
				</>
			}
		>
			{message}	
		</BasicModal>
	);
}



export type { ConfirmModalProps };

export { ConfirmModal };
