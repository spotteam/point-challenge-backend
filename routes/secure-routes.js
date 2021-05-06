const express = require('express');
const router = express.Router();
var { graphqlHTTP } = require('express-graphql');
var { buildSchema, GraphQLScalarType } = require('graphql');
const { User, Post } = require('../models');

var schema = buildSchema(`
  type Query {
    posts: [Post]
  }

  type Mutation {
    createPost(content: String): Post
    editPost(postId: Int, content: String): Post
    deletePost(postId: Int): Int
  }

  scalar Date

  type Post {
    id: Int
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
    console.log("contextttt", params)
    return await Post.findAll({});
  },
  createPost: async ({ context, content }) => {
    return await Post.create({userId: context.user.id, content: content});
  },
  editPost: async ({ context, postId, content }) => {
    await Post.update(
      { content: content },
      {
        where: {
          id: postId,
          userId: context.user.id
        },
        returning: true,
        plain: true,
      }
    ).catch(e => {
      // Swallow errors
      // In practice we'd want to log and monitor these errors and maybe
      // present the user with an error message
    });
    return await Post.findOne({ where: { id: postId, userId: context.user.id } });
  },
  deletePost: async ({ context, postId }) => {
    await Post.destroy({ where: { id: postId, userId: context.user.id } });
    return postId;
  },
};

router.post(
  '/graphql',
  (req, res, next) => {
    console.log(req.user)
    graphqlHTTP({
      schema: schema,
      rootValue: root,
      graphiql: true,
    })
  }
   
);

router.get(
  '/profile',
  (req, res, next) => {
    console.log("got inside")
    res.json({
      message: 'You made it to the secure route',
      user: req.user,
      token: req.query.secret_token
    })
  }
)

module.exports = router;