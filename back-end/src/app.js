const express = require('express');
const app = express();
const ejs = require('ejs');
const db = require('./config/database');
const bodyParser = require('body-parser');
const port = 3000;

// Parse incoming requests with JSON payloads
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('employe',__dirname+'/views/employee');
app.set('table',__dirname+'/views/table');

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Serve the index page
app.get('/', (req, res) => {
  res.render('index');
});

// Serve the employee page
app.get('/employee', (req, res) => {
  
  res.render('employe/employeePage');
});
app.post('/chooseTable', (req, res) => {
  
  res.render('table/listeTable');
});
// Handle form submission for adding data to a table
app.post('/chooseDataTable', (req, res) => {
  const { table } = req.body;
  const { operation } = req.body;
  if (table === 'hotel' ) {
    if (operation === 'add'){
      res.render('table/addHotel');
    }else if (operation === 'delete'){
      res.render ('table/deleteHotel')
    }
    
  } else if (table === 'chaine_hotel' && operation ==='add') {
    res.render('table/addChaineHotel');
  } else if (table === 'chambre'){
    res.render('table/addChambre');

    // Handle error for unknown table
  }
});

app.post('/addHotel', (req, res) => {
  const { id_hotel, nombre_chambres, adresse, email, tel, nom_chaine,ville,category } = req.body;
  db.query(`INSERT INTO hotel(id_hotel, nombre_chambres, adresse, email, tel, nom_chaine, ville, category) VALUES ($1, $2, $3, $4, $5, $6 ,$7, $8)`, [id_hotel, nombre_chambres, adresse, email, tel, nom_chaine, ville, category])
    .then(() => {
      res.send('Hotel added successfully!');
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error adding hotel!');
    });
});
app.post('/deleteHotel', (req, res) => {
  const { id_hotel,nom_chaine,ville } = req.body;
  db.query('DELETE FROM hotel WHERE id_hotel = ? AND nom_chaine = ? AND ville = ?', [id_hotel, nom_chaine, ville])
    .then(() => {
      res.send('Hotel added successfully!');
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error adding hotel!');
    });
});
app.post('/addChaineHotel', (req, res) => {
  const { id_chaine, nom_chaine, adresse_chaine, email_chaine } = req.body;
  db.query(`INSERT INTO chaine_hotel(id_chaine, nom_chaine, adresse_chaine, email_chaine) VALUES ($1, $2, $3, $4)`, [id_chaine, nom_chaine, adresse_chaine, email_chaine])
    .then(() => {
      res.send('Chaine hotel added successfully!');
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error adding chaine hotel!');
    });
});
app.post('/addChambre', (req, res) => {
  const { id_chambre, numero_chambre, prix,commodite, type_chambre,capacite,vue, extension, probleme, id_hotel,disponible } = req.body;
  db.query(`INSERT INTO chambre( id_chambre, numero_chambre, prix, commodite, type_chambre, capacite, vue, extension, probleme, id_hotel, disponible) VALUES ($1, $2, $3, $4, $5, $6 ,$7, $8, $9, $10, $11)`, [id_chambre, numero_chambre, prix,commodite, type_chambre,capacite,vue, extension, probleme, id_hotel,disponible])
    .then(() => {
      res.send('Room added successfully!');
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error adding room!');
    });
});




// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});


