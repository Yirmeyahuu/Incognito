import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes';
import { useSecurity } from './hooks/useSecurity';
import './styles/index.css';

function App() {
  // Apply security measures
  useSecurity();

  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;