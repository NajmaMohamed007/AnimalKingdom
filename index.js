
const express = require('express');
const path = require('path');
const app = express();
const port = 8000;


const mysql = require('mysql2');


const db = mysql2.createConnection({
  host: 'localhost',    // Database host (default: 'localhost')
  user: 'root',         // Database user (replace with your username)
  password: 'password', // Database password (replace with your password)
  database: 'AnimalDatabase' // Database name (replace with your database name)
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database');
});


// Set view engine to EJS
app.set('view engine', 'ejs');

// Middleware to parse URL-encoded bodies (form data)
app.use(express.urlencoded({ extended: true }));

// Middleware to serve static files (CSS, JS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Route for the homepage (GET)
app.get('/', (req, res, next) => {
  const query = `SELECT Animals.name AS animal_name, Animals.species, Continents.continent_name 
                 FROM Animals
                 JOIN Animal_Continents ON Animals.id = Animal_Continents.animal_id
                 JOIN Continents ON Animal_Continents.continent_id = Continents.id`;

  db.query(query, (err, animals) => {
    if (err) {
      return next(err);
    }
    res.render('index', { animals });
  });
});

// Route for adding a new animal (POST)
app.post('/', (req, res, next) => {
  const { animal_name, species, continent } = req.body;

  // Ensure required fields are provided
  if (!animal_name || !species || !continent) {
    return res.status(400).send("Missing required fields.");
  }

  // Insert the new animal into the Animals table
  const animalQuery = `INSERT INTO Animals (name, species) VALUES (?, ?)`;
  db.query(animalQuery, [animal_name, species], (err, result) => {
    if (err) {
      return next(err);
    }

    // After inserting the animal, find the corresponding continent
    const getContinentQuery = `SELECT id FROM Continents WHERE continent_name = ?`;
    db.query(getContinentQuery, [continent], (err, continentResult) => {
      if (err) {
        return next(err);
      }

      if (continentResult.length > 0) {
        // If the continent exists, insert the relationship into Animal_Continents
        const continentId = continentResult[0].id;
        const linkAnimalContinentQuery = `INSERT INTO Animal_Continents (animal_id, continent_id) VALUES (?, ?)`;
        db.query(linkAnimalContinentQuery, [result.insertId, continentId], (err) => {
          if (err) {
            return next(err);
          }

          // Redirect to the homepage after successfully adding the animal
          res.redirect('/');
        });
      } else {
        // If the continent does not exist, send an error message
        res.send("Continent does not exist.");
      }
    });
  });
});

// About route
app.get('/about', (req, res) => {
  res.render('about', { name: 'Najma' });  // Pass your name to the about page
});

// Route for searching animals (GET)
app.get('/search', (req, res, next) => {
  const searchText = req.query.search_text || '';  // Get search text from query string
  const query = `
    SELECT Animals.name AS animal_name, Animals.species, Continents.continent_name 
    FROM Animals
    JOIN Animal_Continents ON Animals.id = Animal_Continents.animal_id
    JOIN Continents ON Animal_Continents.continent_id = Continents.id
    WHERE Animals.name LIKE ? OR Animals.species LIKE ? OR Continents.continent_name LIKE ?`;

  // Use the searchText value in the query
  db.query(query, [`%${searchText}%`, `%${searchText}%`, `%${searchText}%`], (err, animals) => {
    if (err) {
      return next(err);
    }

    // Render the search page with search results and search text
    res.render('search', { animals, searchText });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
