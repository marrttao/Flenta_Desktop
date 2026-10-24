import { Loader } from '../index';



function LoaderTest()
{
	return (
		<div>
			<p>Without labels:</p>
			<span style={{ display: 'flex', gap: '50px', alignItems: 'center' }}>
				<Loader size="small"/>
				<Loader size="medium"/>
				<Loader size="large"/>
			</span>

			<br></br>

			<p>With labels:</p>
			<span style={{ display: 'flex', gap: '50px', alignItems: 'center' }}>
				<Loader size="small" label="Loading small..."/>
				<Loader size="medium" label="Loading medium..."/>
				<Loader size="large" label="Loading large..."/>
			</span>
		</div>
	)
}



export { LoaderTest };