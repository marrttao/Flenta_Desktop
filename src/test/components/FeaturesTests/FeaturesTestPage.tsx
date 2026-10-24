import { Link, useParams } from 'react-router-dom'

import type { ComponentType } from 'react'

import { LocalizationTest } from '../../../features/localization/test/LocalizationTest'



const FEATURE_TEST_PAGES: Record<string, ComponentType> =
{
	localization: LocalizationTest,
}



function FeaturesTestPage()
{
	const { featureName } = useParams<{ featureName: string }>()
	const Page = featureName ? FEATURE_TEST_PAGES[featureName] : undefined

	if (!Page)
	{
		return (
			<div>
				<h1>Feature "{featureName}" not found</h1>
				<p><Link to="/features/test">Back to features tests</Link></p>
			</div>
		)
	}

	return (
		<div>
			<p><Link to="/features/test">Back to features tests</Link></p>
			<Page/>
		</div>
	)
}



export { FeaturesTestPage, FEATURE_TEST_PAGES };