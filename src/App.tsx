import { BrowserRouter, Link, Route, Routes, Navigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

import { AppProviders } from './context/AppProviders'
import { AppRoutes } from './app/routes/AppRoutes.jsx'

import { LanguageSwitcher } from './features/localization/index'
import { ThemeSwitcher } from './features/theme/index'

import { TestHomePage } from './test/index'
import
{
    FeaturesHomePage, FeaturesTestPage,
	UiHomePage, UiTestPage,
	ApiHomePage, ApiTestPage
} from './test/index'

import './App.css'



function HomePage()
{
	return (
		<>
			<h1>HELLO WORLD!</h1>
			<nav aria-label="Main navigation">
				<Link to="/banking">Мій банк</Link>{' | '}
				<Link to="/auth/sign-in">Вхід</Link>{' | '}
				<Link to="/auth/sign-up">Реєстрація</Link>{' | '}
				<Link to="/test">Tests</Link>
			</nav>
		</>
	);
}

function NotFoundPage()
{
	const location = useLocation()

	return (
		<div>
			<h1>404 — no route for {location.pathname}</h1>
			<p><Link to="/">Home</Link></p>
		</div>
	);
}



function App()
{
	return (
		<AppProviders>
			<BrowserRouter>
				<div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 100, display: 'flex', gap: '8px' }}>
					<LanguageSwitcher/>
					<ThemeSwitcher/>
				</div>


				<Routes>
					<Route path="/" element={<HomePage/>}/>
					<Route path="/home" element={<Navigate to="/" replace/>}/>
					<Route path="/auth/*" element={<AppRoutes/>}/>
					<Route path="/profile" element={<AppRoutes/>}/>
					<Route path="/banking" element={<AppRoutes/>}/>



					<Route path="/test" element={<TestHomePage/>}/>

					<Route path="/features/test" element={<FeaturesHomePage/>}/>
					<Route path="/features/:featureName/test" element={<FeaturesTestPage/>}/>

					<Route path="/ui/test" element={<UiHomePage/>}/>
					<Route path="/ui/:uiComponentName/test" element={<UiTestPage/>}/>

					<Route path="/api/test" element={<ApiHomePage/>}/>
					<Route path="/api/:apiName/test" element={<ApiTestPage/>}/>



					<Route path="*" element={<NotFoundPage/>}/>
				</Routes>
			</BrowserRouter>
		</AppProviders>
	)
}



export default App
