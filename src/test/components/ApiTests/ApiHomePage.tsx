import { Link } from 'react-router-dom'

import { API_TEST_PAGES } from './ApiTestPage'



function ApiHomePage()
{
	return (
		<div>
			<h1>API Tests</h1>
			<p><Link to="/test">Back to Tests</Link></p>

			<ul>
				{
					Object.keys(API_TEST_PAGES).map
					(
						(name) =>
						(
							<li key={name}>
								<Link to={`/api/${name}/test`}>{name}</Link>
							</li>
						)
					)
				}
			</ul>
		</div>
	)
}



export { ApiHomePage };