// Configuraçoes iniciais
require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());
const registerRoutes = require('./src/routes/register');
const loginRoutes = require('./src/routes/login');
const todoRoutes = require('./src/routes/todo');

// Middleware para JSON
app.use(express.json());

// Rotas
app.use('/register', registerRoutes);
app.use('/login', loginRoutes);
app.use('/todo', todoRoutes);

// Porta
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
