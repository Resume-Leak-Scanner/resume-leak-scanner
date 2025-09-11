require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const uploadRoute = require('./routes/upload');
app.use('/api/upload', uploadRoute);
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({status: 'ok'}));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server listening on ${port}`));
