import { Link, useParams } from 'react-router-dom'

import type { ComponentType } from 'react'

import { LoaderTest } from '../../../components/ui/Loader/test/LoaderTest'
import { BasicModalTest } from '../../../components/ui/Modals/BasicModal/test/BasicModalTest'
import { ConfirmModalTest } from '../../../components/ui/Modals/ConfirmModal/test/ConfirmModalTest'
import { ToastTest } from '../../../components/ui/Toast/test/ToastTest'



const UI_TEST_PAGES: Record<string, ComponentType> =
{
	loader: LoaderTest,
	basic_modal: BasicModalTest,
	confirm_modal: ConfirmModalTest,
	toast: ToastTest
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