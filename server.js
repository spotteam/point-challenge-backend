const express = require('express');
const passport = require('passport');
const { User, Post } = require('./models');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema, GraphQLScalarType } = require('graphql');
const cors = require('cors');

require('./auth/auth');
const routes = require('./routes/routes');
const secureRoutes = require('./routes/secure-routes');
 
// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type Query {
    posts(userId: Int): [Post]
  }

  type Mutation {
    createPost(userId: Int, content: String): Post
    editPost(userId: Int, postId: Int, content: String): Post
    deletePost(userId: Int, postId: Int): Int
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

// Used to define Date type in GraphQL
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
};
 
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
    return await Post.create({userId: userId, content: content});
  },
  editPost: async ({ userId, postId, content }) => {
    await Post.update(
      { content: content },
      {
        where: {
          id: postId,
          userId: userId
        },
        returning: true,
        plain: true,
      }
    ).catch(e => {
      // Swallow errors
      // In practice we'd want to log and monitor these errors and maybe
      // present the user with an error message
    });
    return await Post.findOne({ where: { id: postId, userId: userId } });
  },
  deletePost: async ({ userId, postId }) => {
    await Post.destroy({ where: { id: postId, userId: userId } });
    return postId;
  },
  createUser: async ({ email, password }) => {
    return await User.create({email: email, password: password});
  },
};

const app = express()
app.use(bodyParser.json()) // middleware to parse application/json requests
app.use(cors()) // enable `cors` to set HTTP response header: Access-Control-Allow-Origin: *

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

app.use('/', routes);
app.use('/tweet', passport.authenticate('jwt', { session: false }), secureRoutes);

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({ error: err });
  console.log(err)
});

app.listen(8080, function() { console.log('Node server listening on port 8080')});
