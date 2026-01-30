import app from './app';
import { env } from './config/env';

const PORT = env.port;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${env.nodeEnv}`);
  
  if (env.nodeEnv === 'development') {
    console.log(`🔗 API: http://localhost:${PORT}/api`);
    console.log(`💚 Health: http://localhost:${PORT}/health`);
  }
});