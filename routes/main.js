const express = require("express")
const router = express.Router()
const request = require('request');


router.get('/', (req, res, next) => {
    // SQL query to retrieve all animals
    const sqlquery = `
        SELECT Animals.animal_name, Animals.species, Continents.continent_name 
        FROM Animals
        JOIN Animal_Continents ON Animals.id = Animal_Continents.animal_id
        JOIN Continents ON Animal_Continents.continent_id = Continents.id
    `;

    db.query(sqlquery, (err, result) => {
        if (err) {
            return next(err);
        }

        // Render the homepage with the list of animals
        res.render('index', { animals: result });
    });
});

// Route to handle the addition of a new animal
router.post('/', (req, res, next) => {
    const { animal_name, species, continent } = req.body;

    // Insert the new animal into the Animals table
    const animalQuery = `INSERT INTO Animals (animal_name, species) VALUES (?, ?)`;
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




// Route for search functionality
router.get('/search', (req, res, next) => {
    // Get the search text from the query parameters
    const searchText = req.query.search_text || ''; 

    // Define the SQL query for searching
    const sqlquery = `
        SELECT Animals.animal_name, Animals.species, Continents.continent_name 
        FROM Animals
        JOIN Animal_Continents ON Animals.id = Animal_Continents.animal_id
        JOIN Continents ON Animal_Continents.continent_id = Continents.id
        WHERE Animals.animal_name LIKE ? OR Animals.species LIKE ?
    `;

    // Execute the query with wildcard search
    const searchValue = `%${searchText}%`; 
    db.query(sqlquery, [searchValue, searchValue], (err, result) => {
        if (err) {
            return next(err); 
        }

        // Render the search page with the results
        res.render('search', { animals: result, searchText });
    });
});

module.exports = router;


router.get('/about',function(req,res,next){
    res.render('about.ejs')
})


module.exports = router
