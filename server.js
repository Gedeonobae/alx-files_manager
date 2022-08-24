import express from 'express';
import Routes from './routes/index';

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
Routes(app);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
