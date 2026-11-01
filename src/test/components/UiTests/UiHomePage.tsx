import { Link } from 'react-router-dom'

import { UI_TEST_PAGES } from './UiTestPage'



function UiHomePage()
{
	return (
		<div>
			<h1>UI Tests</h1>
			<p><Link to="/test">Back to Tests</Link></p>

			<ul>
				{
					Object.keys(UI_TEST_PAGES).map
					(
						(name) =>
						(
							<li key={name}>
								<Link to={`/ui/${name}/test`}>{name}</Link>
							</li>
						)
					)
				}
			</ul>
		</div>
	)
}



export { UiHomePage };