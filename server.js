const express = require('express')
const logger = require('morgan')
const passport = require('passport')
const bodyParser = require('body-parser')
const { User, Post } = require('./models')
var { graphqlHTTP } = require('express-graphql');
var { buildSchema, GraphQLScalarType } = require('graphql');
const cors = require('cors')

require('./auth/auth')
const routes = require('./routes/routes')
const secureRoutes = require('./routes/secure-routes')
 
// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type Query {
    posts(userId: Int): [Post]
  }

  type Mutation {
    createPost(userId: Int, content: String): Post
    createUser(email: String, password: String): User
  }

  scalar Date

  type Post {
    id: Int
    userId: Int
    createdAt: Date
    content: String
  }

  type User {
    id: Int
    email: String
  }
`);

const resolverMap = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) {
      return new Date(value); // value from the client
    },
    serialize(value) {
      return value.getTime(); // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10); // ast value is always in string format
      }
      return null;
    },
  }),
}
 
// The root provides a resolver function for each API endpoint
var root = {
  posts: async params => {
    return await Post.findAll({
      where: {
        userId: params.userId
      }
    });
  },
  createPost: async ({ userId, content }) => {
    var post = await Post.create({userId: userId, content: content})
    console.log(post)
    return post;
  },
  createUser: async ({ email, password }) => {
    var user = await User.create({email: email, password: password})
    console.log(user)
    return user;
  },
};

const app = express()

app.use(cors()) // enable `cors` to set HTTP response header: Access-Control-Allow-Origin: *

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

app.use('/', routes)
app.use('/tweet', passport.authenticate('jwt', { session: false }), secureRoutes)

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({ error: err });
});

app.listen(8080, function() { console.log('Node server listening on port 8080')})
