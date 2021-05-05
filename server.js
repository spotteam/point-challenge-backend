const express = require('express')
const logger = require('morgan')
const passport = require('passport')
const bodyParser = require('body-parser')

require('./auth/auth')
const routes = require('./routes/routes')
const secureRoutes = require('./routes/secure-routes')


const app = express()

app.use(logger('dev'))
app.use(bodyParser.urlencoded({extended: false}))

app.use('/', routes)
app.use('/tweet', passport.authenticate('jwt', { session: false }), secureRoutes)

app.use(function(err, req, res, next) {
  console.log(err, req, res, next)
  res.status(err.status || 500);
  res.json({ error: err });
});

app.listen(3000, function() { console.log('Node server listening on port 3000')})
