const express = require('express');
const passport = require('passport');
const { User, Post } = require('./models');
const bodyParser = require('body-parser');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema, GraphQLScalarType } = require('graphql');
const cors = require('cors');

require('./auth/auth');
const routes = require('./routes/routes');
const secureRoutes = require('./routes/secure-routes');

 
// Construct a schema, using GraphQL schema language

const app = express()

app.use(bodyParser.json()) // middleware to parse application/json requests

app.use(cors()) // enable `cors` to set HTTP response header: Access-Control-Allow-Origin: *

app.use('/', routes);
app.use('/secure', passport.authenticate('jwt', { session: false }), secureRoutes);

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({ message: err.message });
});

app.listen(process.env.PORT || 8080, function() { console.log('Node server listening on a port')});
