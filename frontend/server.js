const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = 49213;

app.use('/api', createProxyMiddleware({ 
  target: 'http://127.0.0.1:5000', 
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api', // rewrite path, but actually wait, Express strips it so it becomes '/'?
    // Wait, Express strips '/api', so the request to the proxy is '/auth/login'
    // But we need the target to receive '/api/auth/login'
    '^/': '/api/'
  }
}));

app.use('/uploads', createProxyMiddleware({ 
  target: 'http://127.0.0.1:5000', 
  changeOrigin: true,
  pathRewrite: {
    '^/': '/uploads/'
  }
}));

app.use(express.static(path.join(__dirname, 'dist/frontend/browser')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist/frontend/browser/index.html'));
});

const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`Production server running on http://127.0.0.1:${PORT}`);
});
server.on('error', (e) => {
  console.error("Server error:", e);
  process.exit(1);
});
// Keep alive explicitly
setInterval(() => {}, 1000 * 60 * 60);
