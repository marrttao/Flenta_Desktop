import { AuthProvider } from './features/auth/components/AuthProvider.jsx'
import { AppRoutes } from './app/routes/AppRoutes.jsx'

export default function App() {
  return <AuthProvider><AppRoutes /></AuthProvider>
}
