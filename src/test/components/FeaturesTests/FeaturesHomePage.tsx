import { Link } from 'react-router-dom'

import { FEATURE_TEST_PAGES } from './FeaturesTestPage'



function FeaturesHomePage()
{
	return (
		<div>
			<h1>Features Tests</h1>
			<p><Link to="/test">Back to Tests</Link></p>

			<ul>
				{
					Object.keys(FEATURE_TEST_PAGES).map
					(
						(name) =>
						(
							<li key={name}>
								<Link to={`/features/${name}/test`}>{name}</Link>
							</li>
						)
					)
				}
			</ul>
		</div>
	)
}



export { FeaturesHomePage };