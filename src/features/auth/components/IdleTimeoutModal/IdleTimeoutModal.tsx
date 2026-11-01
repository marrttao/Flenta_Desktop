import { useTranslation } from '../../../localization/index';

import { BasicModal } from '../../../../components/ui/Modals/BasicModal/index';

import styles from './IdleTimeoutModal.module.css';


interface IdleTimeoutModalProps
{
	isOpen: boolean;
	secondsLeft: number;

	onStay: () => Promise<void>;
	onLogout: () => Promise<void>;
}



function IdleTimeoutModal({ isOpen, secondsLeft, onStay, onLogout }: IdleTimeoutModalProps)
{
	const { translate } = useTranslation();

	return (
		<BasicModal
			isOpen={isOpen} onClose={() => undefined}
			size="small" title={translate('auth.idle.title')}
			showCloseButton={false} closeOnBackdropClick={false} closeOnEscapeClick={false}
			footer =
			{
				<>
					<button type="button" className={`${styles.button} ${styles.button_secondary}`} onClick={() => void onLogout()}>{translate('auth.idle.logout')}</button>
					<button type="button" className={`${styles.button} ${styles.button_primary}`} onClick={() => void onStay()}>{translate('auth.idle.stay')}</button>
				</>
			}
		>
			<p className={styles.description}>{translate('auth.idle.description').replace('{seconds}', String(secondsLeft))}</p>
		</BasicModal>
	);
}



export type { IdleTimeoutModalProps };

export { IdleTimeoutModal };