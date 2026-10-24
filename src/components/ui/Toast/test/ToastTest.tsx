import { useToast } from '../hooks/useToast';



function ToastTest()
{
	const toast = useToast();

	return (
		<div style={{ gap: '10px' }}>
			<p>Without messages</p>
			<span style={{ display: 'flex', gap: '10px' }}>
				<button type="button" onClick={() => toast.showToast({ type: 'success', title: 'Success' })}>Show Success Toast</button>
				<button type="button" onClick={() => toast.showToast({ type: 'error', title: 'Error' })}>Show Error Toast</button>
				<button type="button" onClick={() => toast.showToast({ type: 'info', title: 'Info' })}>Show Info Toast</button>
				<button type="button" onClick={() => toast.showToast({ type: 'warning', title: 'Warning' })}>Show Warning Toast</button>
			</span>

			<hr style={{ margin: '45px 0' }}/>
			
			<p>With messages</p>
			<span style={{ display: 'flex', gap: '10px' }}>
				<button type="button" onClick={() => toast.showToast({ type: 'success', title: 'Success', message: 'This is a success toast' })}>Show Success Toast</button>
				<button type="button" onClick={() => toast.showToast({ type: 'error', title: 'Error', message: 'This is an error toast' })}>Show Error Toast</button>
				<button type="button" onClick={() => toast.showToast({ type: 'info', title: 'Info', message: 'This is an info toast' })}>Show Info Toast</button>
				<button type="button" onClick={() => toast.showToast({ type: 'warning', title: 'Warning', message: 'This is a warning toast' })}>Show Warning Toast</button>
			</span>
		</div>
	);
}



export { ToastTest };