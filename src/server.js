const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[Server] Provider Registration API running on port ${PORT}`);
});
