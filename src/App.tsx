import { BrowserRouter, Link, Route, Routes, Navigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

import { AppProviders } from './context/AppProviders'
import { FeaturesTestPage, TestHomePage } from './test/index'

import './App.css'



function HomePage()
{
	return (
		<h1>HELLO WORLD!</h1>
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
                <Routes>
                    <Route path="/" element={<HomePage/>}/>
                    <Route path="/home" element={<Navigate to="/" replace/>}/>

                    <Route path="/test" element={<TestHomePage/>}/>
                    <Route path="/:featureName/test" element={<FeaturesTestPage/>}/>

                    <Route path="*" element={<NotFoundPage/>}/>
                </Routes>
            </BrowserRouter>
        </AppProviders>
    )
}



export default App