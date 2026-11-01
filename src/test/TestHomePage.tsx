import { Link } from 'react-router-dom'

function TestHomePage()
{
	return (
		<div>
			<h1>Tests</h1>
			<p><Link to="/">Home</Link></p>

			<ul>
				<li><Link to="/features/test">Features</Link></li>
				<li><Link to="/ui/test">UI</Link></li>
				<li><Link to="/api/test">API</Link></li>
			</ul>
		</div>
	);
}

export { TestHomePage };