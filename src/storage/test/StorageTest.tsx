import { useReducer, useState } from 'react';
import { createPortal } from 'react-dom';

import { storageService, StorageKeys, isSensitiveKey } from '../index';

import { ConfirmModal } from '../../components/ui/Modals/ConfirmModal/index';
import { Loader } from '../../components/ui/Loader/index';



const ALL_KEYS = Object.values(StorageKeys) as StorageKeys[];
const getRandomDelationDelay = (): number => { return Math.floor(Math.random() * (2000 - 500 + 1)) + 500 }



function StorageTest()
{
	const [, rerender] = useReducer((x: number) => x + 1, 0);
	
	const [key, setKey] = useState<StorageKeys>(StorageKeys.FOR_TEST_NON_SENSITIVE_1);
	const [value, setValue] = useState<string>('"dark"');
	const [result, setResult] = useState<string | null>(null);

	const [confirmClearAll, setConfirmClearAll] = useState<boolean>(false);
	const [isDeleting, setIsDeleting] = useState<boolean>(false);



	const handleSetItem = () =>
	{
		let parsedValue: unknown;

		try { parsedValue = JSON.parse(value); }
		catch (error)
		{
			setResult(`[StorageTestPage.handleSetItem()] The JSON is invalid: ${value} - ${error}`);
			
			return;
		}

		storageService.setItem(key, parsedValue);

		setResult(`Item set successfully: ${key} = ${JSON.stringify(parsedValue)}`);
		rerender();
	}
	const handleGetItem = () =>
	{
		const item = storageService.getItem(key);

		setResult(`Item retrieved: ${key} = ${JSON.stringify(item)}`);
	}
	const handleRemoveItem = async () =>
	{
		setIsDeleting(true);
		await new Promise((resolve) => setTimeout(resolve, getRandomDelationDelay()));
		
		storageService.removeItem(key);

		setResult(`Item removed: ${key}`);
		setIsDeleting(false);
		rerender();
	}

	const handleClearSensitiveItems = async () =>
	{
		setIsDeleting(true);
		await new Promise((resolve) => setTimeout(resolve, getRandomDelationDelay()));

		storageService.clearSensitive();

		setResult('Sensitive items (from cookies) cleared successfully');
		setIsDeleting(false);

		rerender();
	}
	const handleClearNonSensitiveItems = async () =>
	{
		setIsDeleting(true);
		await new Promise((resolve) => setTimeout(resolve, getRandomDelationDelay()));

		storageService.clearNonSensitive();

		setResult('Non-sensitive items (from localStorage) cleared successfully');
		setIsDeleting(false);

		rerender();
	}

	const handleClearAllItems = async () =>
	{
		setIsDeleting(true);
		await new Promise((resolve) => setTimeout(resolve, getRandomDelationDelay()));

		storageService.clearAll();

		setResult('All items cleared successfully');
		setConfirmClearAll(false);
		setIsDeleting(false);

		rerender();
	}



	return (
		<>
			<div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
				<section>
					<h3>Set Item, Get Item, Remove Item</h3>

					<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
						<select value={key} onChange={(event) => setKey(event.target.value as StorageKeys)}>
							{
								ALL_KEYS.map
								(
									(key) =>
									(
										<option key={key} value={key}>
											{key} ({isSensitiveKey(key) ? 'Cookie' : 'LocalStorage'})
										</option>
									)
								)
							}
						</select>
						<input value={value} onChange={(event) => setValue(event.target.value)} placeholder='Enter value (JSON)' style={{ width: '200px', padding: '4px 8px' }}/>
						
						<span style={{ display: 'flex', gap: '8px' }}>
							<button onClick={handleSetItem}>Set Item</button>
							<button onClick={handleGetItem}>Get Item</button>
							<button onClick={handleRemoveItem}>Remove Item</button>
						</span>
					</div>
				</section>

				<section>
					<h3>Clear Items</h3>

					<div style={{ display: 'flex', gap: '8px' }}>
						<button type='button' onClick={handleClearSensitiveItems}>Clear Sensitive Items (Cookies)</button>
						<button type='button' onClick={handleClearNonSensitiveItems}>Clear Non-Sensitive Items (LocalStorage)</button>
						<button type='button' onClick={() => setConfirmClearAll(true)}>Clear All Items</button>
					</div>
				</section>

				<section>
					<h3>Values:</h3>
					
					<table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '14px', marginTop: '8px' }}>
						<thead>
							<tr style={{ backgroundColor: '#222222', borderBottom: '1px solid #444444', textAlign: 'left' }}>
								<th style={{ padding: '8px', color: '#ffffff' }}>Key</th>
								<th style={{ padding: '8px', color: '#ffffff' }}>Type</th>
								<th style={{ padding: '8px', color: '#ffffff' }}>Value</th>
							</tr>
						</thead>

						<tbody>
							{
								ALL_KEYS.map
								(
									(key) =>
									{
										const item = storageService.getItem(key);

										return (
											<tr key={key} style={{ borderBottom: '1px solid #444444' }}>
												<td style={{ padding: '8px' }}>{key}</td>
												<td style={{ padding: '8px' }}>{isSensitiveKey(key) ? 'Cookie' : 'LocalStorage'}</td>
												<td style={{ padding: '8px' }}>{item === null ? '<null>' : JSON.stringify(item)}</td>
											</tr>
										);
									}
								)
							}
						</tbody>
					</table>
				</section>

				{
					result &&
					(
						<section style={{ marginTop: '16px', padding: '12px 16px', backgroundColor: '#1e1e1e', border: '1px solid #444444', borderRadius: '6px', fontSize: '14px', color: '#e5e5e5', wordBreak: 'break-all' }}>
							{result}
						</section>
					)
				}

				<ConfirmModal
					isOpen={confirmClearAll}
					onClose={() => setConfirmClearAll(false)} onConfirm={handleClearAllItems}
					title='Clear All Storage?' message='Are you sure you want to clear all items? This action cannot be undone.'
					variant='danger'
				/>
			</div>

			{
				isDeleting &&
				createPortal
				(
					<div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', top: 0, left: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999 }}>
						<Loader size="large" label="Processing..."/>
					</div>,
					document.body
				)
			}
		</>
	);
}



export { StorageTest };