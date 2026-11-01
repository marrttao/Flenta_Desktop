import { useState } from 'react';

import { BasicModal, type ModalSize } from '../components/BasicModal';



function BasicModalTest()
{
	const [isOpen, setIsOpen] = useState(false);
	const [size, setSize] = useState<ModalSize>('medium');

	return (
		<>
			<div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
				<button type="button" onClick={() => setIsOpen(true)}>Open Modal</button>

				<select value={size} onChange={(event) => setSize(event.target.value as ModalSize)}>
					<option value="small">Small</option>
					<option value="medium">Medium</option>
					<option value="large">Large</option>
				</select>
				<p>Current size: {size}</p>
			</div>

			<BasicModal isOpen={isOpen} size={size} title="Basic Modal Test" onClose={() => setIsOpen(false)}>
				<p style={{ margin: 0 }}>This is a test modal with size: <b>{size}</b></p>
			</BasicModal>
		</>
	)
}



export { BasicModalTest };