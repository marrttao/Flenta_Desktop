import { Link, useParams } from 'react-router-dom'

import type { ComponentType } from 'react'

import { LoaderTestPage } from '../../../components/ui/Loader/test/LoaderTestPage'



const UI_TEST_PAGES: Record<string, ComponentType> =
{
	loader: LoaderTestPage,
}



function UiTestPage()
{
	const { uiComponentName } = useParams<{ uiComponentName: string }>()
	const Page = uiComponentName ? UI_TEST_PAGES[uiComponentName] : undefined

	if (!Page)
	{
		return (
			<div>
				<h1>UI component "{uiComponentName}" not found</h1>
				<p><Link to="/ui/test">Back to UI tests</Link></p>
			</div>
		)
	}

	return (
		<div>
			<p><Link to="/ui/test">Back to UI tests</Link></p>
			<Page/>
		</div>
	)
}



export { UiTestPage, UI_TEST_PAGES };