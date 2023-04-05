const express = require('express');
const app = express();
const ejs = require('ejs');
const db = require('./config/database');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const port = 3005;

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
app.get('/client', (req, res) => {
  
  res.render('client/clientPage');
});
app.post('/filterRooms', async (req, res) => {
  const {
    start_date,
    end_date,
    chaine_hoteliere,
    categorie_hotel,
    nombre_chambres,
    prix
  } = req.body;

  
    db.query(`
      SELECT * FROM chambre c
      JOIN hotel h ON c.id_hotel = h.id_hotel
      WHERE h.nom_chaine = $1
        AND h.category = $2
        AND h.nombre_chambres >= $3
        AND c.prix <= $4
        AND NOT EXISTS (
          SELECT 1 FROM reservation r
          WHERE r.id_chambre = c.id_chambre
            AND (
              (r.start_date BETWEEN $5 AND $6)
              OR (r.end_date BETWEEN $5 AND $6)
              OR ($5 BETWEEN r.start_date AND r.end_date)
              OR ($6 BETWEEN r.start_date AND r.end_date)
            )
        )
        `, [chaine_hoteliere, categorie_hotel, nombre_chambres, prix, start_date, end_date])
        .then((result)=> {console.log("Query result:",result);
        res.render('client/displayFilterRooms',{results:result});})
});
app.post('/registerClient', (req, res) => {
  const {id_chambre} = req.body;
  
  
  const query = `
    SELECT hotel.id_hotel
    FROM chambre
    JOIN hotel ON chambre.id_hotel = hotel.id_hotel
    WHERE chambre.id_chambre = $1
  `;

  db.query(query,[id_chambre])
  .then((result) => {
    
    if (result.length > 0) {
      const id_hotel = result[0].id_hotel;
      res.render('client/registerClient', { id_chambre, id_hotel });
      
    } else {
      res.send('No id_chambre');
    }
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error searching for chambres!');
  });
    
  
});

//SUBMIT REGISTRATION AND RESERVATION
app.post('/submitRegistration', (req, res) => {
  const { nom_complet, nas, adresse, tel,  id_hotel } = req.body;

  const id_client = parseInt(Math.random() * 10000);

  const date_enregistrement = new Date().toISOString().substr(0, 10);;

  db.query(`INSERT INTO client( id_client, nom_complet, nas, adresse, tel, date_enregistrement, id_hotel) VALUES ($1, $2, $3, $4, $5, $6 ,$7)`, [id_client, nom_complet, nas, adresse, tel, date_enregistrement, parseInt(id_hotel)])
    .then(() => {
      res.send('Client registred successfully!');
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error adding client!');
    });
});




// Serve the employee page
app.get('/employee', (req, res) => {
  
  res.render('employe/employeePage');
});
app.post('/chooseTable', (req, res) => {
  res.render('table/listeTable');
});

// Handle form submission for adding, deleting, search and modify data to a table
app.post('/chooseDataTable', (req, res) => {
  const { table } = req.body;
  const { operation } = req.body;

  // Handle hotel table requests
  if (table === 'hotel' ) {
    if (operation === 'add'){
      res.render('table/addHotel');
    }else if (operation === 'delete'){
      res.render ('table/deleteHotel')
    }else if (operation === 'search'){
      res.render('table/searchHotel')
    }else if (operation ==='modify'){
      res.render('table/modifyHotel')
    }
    
  } else if (table === 'chaine_hotel' && operation ==='add') {
    res.render('table/addChaineHotel');
  } 
  // Handle Chambre table requests
  else if (table === 'chambre'){
    if (operation === "add"){
      res.render('table/addChambre');
    }else if (operation === "delete"){
      res.render('table/deleteChambre');
    }else if (operation ==='search'){
      res.render('table/searchChambre');
    }else if (operation === 'modify'){
      res.render('table/modifyChambre');
    }
  }
  // Handle Client table requests
  else if (table === 'client'){
    if (operation === 'add'){
      res.render('table/addClient');
    }else if (operation === 'delete'){
      res.render('table/deleteClient');
    }else if(operation === 'modify'){
      res.render('table/modifyClient')
    }else if(operation === 'search'){
      res.render('table/searchClient')
    }
    

    
  }
  // Handle employee table requests
  else if (table === 'employe'){
    if (operation === 'add'){
      res.render('table/addEmployee');
    }else if (operation === 'delete'){
      res.render('table/deleteEmployee');
    }else if (operation === 'search'){
      res.render('table/searchEmploye');
    }else if (operation === 'modify'){
      res.render('table/modifyEmploye')
    }

    
  }
});

//
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
//
app.post('/deleteHotel', (req, res) => {
  const { id_hotel,nom_chaine,ville } = req.body;
  db.query('DELETE FROM hotel WHERE id_hotel = ? AND nom_chaine = ? AND ville = ?', [id_hotel, nom_chaine, ville])
    .then(() => {
      res.send('Hotel deleted successfully!');
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error deleting hotel!');
    });
});
//
app.post('/searchHotel', (req, res) => {
  const { nom_chaine, ville } = req.body;
  db.query('SELECT * FROM hotel WHERE nom_chaine = $1 AND ville = $2', [nom_chaine, ville])
    .then((result) => {
      console.log('Query result:', result);
      if (result.length > 0) {
        res.render('table/searchResultHotel', { results: result });
      } else {
        res.send('No results found');
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error searching for hotels!');
    });
});
// 
app.post('/modifyHotel', (req,res) => {
  const { id_hotel, nombre_chambres, adresse, email, tel, nom_chaine,ville,category } = req.body;
  db.query('UPDATE hotel SET nombre_chambres= $2, adresse = $3, email = $4, tel = $5, nom_chaine = $6, ville = $7, category = $8 WHERE id_hotel= $1', [id_hotel, nombre_chambres, adresse, email, tel, nom_chaine, ville, category])
  .then(()=> {
    res.send('Hotel updated successfully!');
  }).catch((error)=>{
    console.error(error);
    res.status(500).send('Error updating hotel');
  })
})
//
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
//
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
app.post('/deleteChambre', (req, res) => {
  const { nom_complet} = req.body;
  db.query('DELETE FROM  chambre WHERE id_chambre = ? ', [nom_complet])
    .then(() => {
      res.send('Chambre deleted successfully!');
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error deleting Chambre!');
    });
});
app.post('/searchChambre', (req, res) => {
  const { nom_chaine, ville, type_chambre, disponible } = req.body;
  const queryString = `
    SELECT c.*
    FROM chambre c
    JOIN hotel h ON c.id_hotel = h.id_hotel
    WHERE h.nom_chaine = $1
      AND h.ville = $2
      AND c.type_chambre = $3
      AND c.disponible = $4
  `;

  db.query(queryString, [nom_chaine, ville, type_chambre, disponible])
    .then((result) => {
      console.log('Query result:', result);
      if (result.length > 0) {
        res.render('table/ResultChambre', { results: result });
      } else {
        res.send('No results found');
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error searching for chambres!');
    });
});
//
app.post('/modifyChambre', (req, res) => {
  const { id_chambre, numero_chambre, prix, commodite, type_chambre, capacite, vue, extension, probleme, id_hotel, disponible } = req.body;
  const queryString = `
    UPDATE chambre
    SET numero_chambre = $2,
        prix = $3,
        commodite = $4,
        type_chambre = $5,
        capacite = $6,
        vue = $7,
        extension = $8,
        probleme = $9,
        id_hotel = $10,
        disponible = $11
    WHERE id_chambre = $1
  `;

  db.query(queryString, [id_chambre, numero_chambre, prix, commodite, type_chambre, capacite, vue, extension, probleme, id_hotel, disponible])
    .then(() => {
      res.send('Chambre updated successfully!');
    }).catch((error) => {
      console.error(error);
      res.status(500).send('Error updating chambre');
    });
});

//

app.post('/addClient', (req, res) => {
  const { id_client, nom_complet, nas, adresse, tel, date_enregistrement, id_hotel } = req.body;
  db.query(`INSERT INTO client( id_client, nom_complet, nas, adresse, tel, date_enregistrement, id_hotel) VALUES ($1, $2, $3, $4, $5, $6 ,$7)`, [id_client, nom_complet, nas, adresse, tel, date_enregistrement, id_hotel])
    .then(() => {
      res.send('Client added successfully!');
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error adding client!');
    });
});
app.post('/deleteClient', (req, res) => {
  const { nom_complet} = req.body;
  db.query('DELETE FROM  client WHERE nom_complet = ? ', [nom_complet])
    .then(() => {
      res.send('CLIENT deleted successfully!');
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error deleting client!');
    });
});
app.post('/searchClient', (req, res) => {
  const { nom_complet} = req.body;
  db.query('SELECT * FROM client WHERE nom_complet = $1', [nom_complet])
    .then((result) => {
      console.log('Query result:', result);
      if (result.length > 0) {
        res.render('table/resultClient', { results: result });
      } else {
        res.send('No results found');
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error searching for hotels!');
    });
});
// 
app.post('/modifyClient', (req, res) => {
  const { id_client, nom_complet, nas, adresse, tel, id_hotel } = req.body;
  const queryString = `
    UPDATE client
    SET nom_complet = $2,
        nas = $3,
        adresse = $4,
        tel = $5,
        id_hotel = $6
    WHERE id_client = $1
  `;

  db.query(queryString, [id_client, nom_complet, nas, adresse, tel, id_hotel])
    .then(() => {
      res.send('Client updated successfully!');
    }).catch((error) => {
      console.error(error);
      res.status(500).send('Error updating client');
    });
});
//
app.post('/addEmployee', (req, res) => {
  const { id_employe, nom_complet, adresse, nas, role, id_hotel } = req.body;
  db.query(`INSERT INTO employe( id_employe, nom_complet, adresse, nas, role, id_hotel) VALUES ($1, $2, $3, $4, $5, $6)`, [id_employe, nom_complet, adresse, nas, role, id_hotel])
    .then(() => {
      res.send('Employee added successfully!');
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error adding employee!');
    });
});
app.post('/deleteEmployee', (req, res) => {
  const { nom_complet} = req.body;
  db.query('DELETE FROM  employee WHERE nom_complet = ? ', [nom_complet])
    .then(() => {
      res.send('Employee deleted successfully!');
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error deleting Employee!');
    });
});
app.post('/searchEmploye', (req, res) => {
  const { nom_complet, role, nom_chaine, ville } = req.body;
  const queryString = `
    SELECT c.*
    FROM employe c
    JOIN hotel h ON c.id_hotel = h.id_hotel
    WHERE h.nom_chaine = $3
      AND h.ville = $4
      AND c.nom_complet LIKE $1
      AND c.role = $2
  `;

  const nomCompletParam = nom_complet ? `%${nom_complet}%` : '%';

  db.query(queryString, [nomCompletParam, role, nom_chaine, ville])
    .then((result) => {
      console.log('Query result:', result);
      if (result.length > 0) {
        res.render('table/resultEmploye', { results: result });
      } else {
        res.send('No results found');
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error searching for employes!');
    });
});
// 
app.post('/modifyEmployee', (req, res) => {
  const { id_employe, nom_complet, adresse, nas, role, id_hotel } = req.body;
  const queryString = `
    UPDATE employe
    SET nom_complet = $2,
        adresse = $3,
        nas = $4,
        role = $5,
        id_hotel = $6
    WHERE id_employe = $1
  `;

  db.query(queryString, [id_employe, nom_complet, adresse, nas, role, id_hotel])
    .then(() => {
      res.send('Employee updated successfully!');
    }).catch((error) => {
      console.error(error);
      res.status(500).send('Error updating employee');
    });
});





// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});


