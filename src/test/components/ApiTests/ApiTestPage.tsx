import { Link, useParams } from 'react-router-dom'

import type { ComponentType } from 'react'

import { CurrencyApiTest } from '../../../features/currency/test/CurrencyApiTest'



const API_TEST_PAGES: Record<string, ComponentType> =
{
	currency: CurrencyApiTest,
}



function ApiTestPage()
{
	const { apiName } = useParams<{ apiName: string }>()
	const Page = apiName  ? API_TEST_PAGES[apiName] : undefined

	if (!Page)
	{
		return (
			<div>
				<h1>API "{apiName}" not found</h1>
				<p><Link to="/api/test">Back to UI tests</Link></p>
			</div>
		)
	}

	return (
		<div>
			<p><Link to="/api/test">Back to UI tests</Link></p>
			<Page/>
		</div>
	)
}



export { ApiTestPage, API_TEST_PAGES };