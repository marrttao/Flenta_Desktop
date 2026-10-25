import { useState } from 'react';

import { ConfirmModal } from '../components/ConfirmModal';



function ConfirmModalTest()
{
	const [isOpen, setIsOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [variant, setVariant] = useState<'primary' | 'secondary' | 'danger'>('primary');

	const handleConfirm = () =>
	{
		setLoading(true);

		setTimeout
		(
			() =>
			{
				setLoading(false);
				setIsOpen(false);
			},
			2000
		)
	}

	return (
		<>
			<div style={{ display: 'flex', gap: '10px' }}>
				<button type="button" onClick={() => setIsOpen(true)}>Open Confirm Modal</button>

				<select value={variant} onChange={(event) => setVariant(event.target.value as 'primary' | 'secondary' | 'danger')}>
					<option value="primary">Primary</option>
					<option value="secondary">Secondary</option>
					<option value="danger">Danger</option>
				</select>
			</div>

			<ConfirmModal isOpen={isOpen} title="Confirm Action" message="Are you sure you want to proceed?" confirmText="Yes" cancelText="No" variant={variant} loading={loading} onClose={() => setIsOpen(false)} onConfirm={handleConfirm} />
		</>
	);
}



export { ConfirmModalTest };