import { Link } from 'react-router-dom'

function TestHomePage()
{
	return (
		<div>
			<h1>Tests</h1>
			<p><Link to="/">Home</Link></p>

			<ul>
				<li><Link to="/localization/test">Localization</Link></li>
			</ul>
		</div>
	);
}

export { TestHomePage };