const express = require('express');
const jwt = require('jsonwebtoken');
const hashedSecret = require('../crypto/config');
const users = require('../data/users');
const verifyToken = require('../middlewares/authMiddleware');
const axios = require('axios');

const router = express.Router();

router.get('/', (req, res) => {
    // const token = req.session.token;
  
    // Si ya hay un token
    // if (token) {
    //   const decoded = jwt.verify(token, secret);
  
    //   return res.send(`
    //       <h1>Bienvenido, ${decoded.name}</h1>
    //       <a href="/dashboard">Ir al Dashboard</a><br><br>
    //       <form action="/logout" method="post">
    //           <button type="submit">Cerrar Sesión</button>
    //       </form>
    //   `)
    // }
  
    //Si no hay token    
    const loginForm = `
      <h1>Iniciar Sesión</h1>
      <form action="/login" method="post">
          <label for="username">Usuario</label>
          <input type="text" id="username" name="username" required><br><br>
          <label for="password">Contraseña</label>
          <input type="password" id="password" name="password" required><br><br>
          <button type="submit">Iniciar sesión</button>
      </form>
    `;
    res.send(loginForm);
  });

  router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username && user.password === password);
  
    if (!user) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }
  
    
    const token = jwt.sign({ id: user.id }, hashedSecret, { expiresIn: '1h' });
    req.session.token = token;
  
    res.redirect('/search');
  });

  
  router.get('/search', verifyToken, (req, res) => {
    const userId = req.user;
    const user = users.find((user) => user.id === userId);
  
    if (!user) {
        res.status(401).json({ mensaje: 'Usuario no encontrado' });
    
    } else {
    res.send(`
            <h1>Buscar Personaje</h1>
            <form action="/characters" method="get">
                <input type="text" id="characterName" name="name" placeholder="Nombre de personaje" required/>
                <button type="submit">Buscar</button>
            </form>
            <form action="/logout" method="post">
                <button class="logout-btn" type="submit">Cerrar sesión</button>
            </form>
            `)
    }
  });
  
  

  router.get('/characters/:name', async (req, res) => {
    const characterName = req.params.name;
    console.log(characterName);
  
    try {
      
      const response = await axios.get(`https://rickandmortyapi.com/api/character/?name=${characterName}`);
      const data = response.data.results;
  
      if (!data || data.length === 0) {
        return res.status(404).json({ mensaje: 'Personaje no encontrado' });
      }
  
     
      const character = data[0];
  
      
      const { name, status, species, gender, image, origin } = character;
  
      
      res.send(`
        <h1>${name}</h1>
        <p><strong>Estado:</strong> ${status}</p>
        <p><strong>Especie:</strong> ${species}</p>
        <p><strong>Género:</strong> ${gender}</p>
        <p><strong>Origen:</strong> ${origin.name}</p>
        <img src="${image}" alt="Imagen de ${name}" />
      `);
      
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: "Error al buscar el personaje" });
    }
  });
  

  module.exports = router