const express = require('express');
const path = require('path');
const app = express();
const port = 8000;

const db = mysql.createConnection ({
  host: 'localhost',
  user: 'portfolio_app',
  password: 'qwertyuiop',
  database: 'portfolio'
})
// Connect to the database
db.connect((err) => {
  if (err) {
      throw err
  }
  console.log('Connected to database')
})
global.db = db

const mainRoutes = require('./routes/main');

// Set the view engine to ejs
app.set('view engine', 'ejs');
app.use('/', mainRoutes);


// Start the server
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
