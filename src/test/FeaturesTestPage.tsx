import { useParams } from 'react-router-dom'

import type { ComponentType } from 'react'

import { LocalizationTestPage } from '../features/localization/test/LocalizationTestPage'



const PAGES: Record<string, ComponentType> =
{
	localization: LocalizationTestPage,
}



function FeaturesTestPage()
{
	const { featureName } = useParams<{ featureName: string }>()
	const Page = featureName ? PAGES[featureName] : undefined

	if (!Page)
	{
		return <div>Feature "{featureName}" not found</div>
	}

	return <Page/>
}



export { FeaturesTestPage };