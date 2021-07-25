const express = require('express');
const connectDb = require('./config/db');
const app = express();

//DB connection call
connectDb();

//init middleware(to pass value to req.body)
app.use(express.json({ extended: false }))

//test route
app.get('/', (req, res) => { res.send('App Running') })
//user route
app.use('/api/user', require('./routes/api/user'));
//auth route
app.use('/api/auth', require('./routes/api/auth'));
//profile route
app.use('/api/profile', require('./routes/api/profile'));
//posts route
app.use('/api/posts', require('./routes/api/posts'));

//PORT declaration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });