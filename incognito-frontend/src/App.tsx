import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes';
import { useSecurity } from './hooks/useSecurity';
import { InAppBrowserBanner } from './components/common/InAppBrowserBanner';
import { Analytics } from "@vercel/analytics/react"
import './styles/index.css';

function App() {
  // Apply security measures
  useSecurity();

  return (
    <AuthProvider>
      <InAppBrowserBanner />
      <AppRoutes />
      <Analytics />
    </AuthProvider>
  );
}

export default App;