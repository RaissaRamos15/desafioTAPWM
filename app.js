const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require('./firebase-config.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();

// Configuração do Handlebars
const hbs = exphbs.create({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views', 'layouts') // Caminho correto para layouts
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views')); // Caminho correto para views

// Middleware para processar dados do formulário
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Rota para a página inicial 
app.get('/', function (req, res) {
  res.render('home');
});

// Rota para a página de login
app.get('/login', function (req, res) {
  res.render('login');
});

// Rota para a página de registro
app.get('/register', function (req, res) {
  res.render('register');
});

// Rota para criar um novo usuário
app.post('/register', function (req, res) {
  const { email, password } = req.body;

  auth.createUser({
    email: email,
    password: password
  })
  .then(userRecord => {
    console.log('Usuário criado com sucesso:', userRecord.uid);
    res.redirect('/login');
  })
  .catch(error => {
    console.error('Erro ao criar usuário:', error);
    res.redirect('/register');
  });
});

// Rota para fazer login do usuário
app.post('/login', async function (req, res) {
  const { email, password } = req.body;

  try {
    // Verifica se o usuário existe no Firebase Authentication
    const userRecord = await auth.getUserByEmail(email);

    console.log('Successfully fetched user data:', userRecord.toJSON());
    res.redirect('/');
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.redirect('/login');
  }
});

// Iniciar servidor
app.listen(8081, function () {
  console.log('Servidor ativo!');
});
