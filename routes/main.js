const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'portfolio_app',
  password: 'qwertyuiop',
  database: 'portfolio'
});

// Connect to the database
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to the database');
});

// Route for the homepage (GET)
router.get('/', (req, res, next) => {
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

// Route for the About page (GET)
router.get('/about', (req, res) => {
  res.render('about', { name: 'Najma' });  // Pass your name to the about page
});

// Route for searching animals (GET)
router.get('/search', (req, res, next) => {
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

// Route for adding a new animal (POST)
router.post('/', (req, res, next) => {
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

module.exports = router;
