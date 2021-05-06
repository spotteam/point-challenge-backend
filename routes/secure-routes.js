const express = require('express');
const router = express.Router();
var { graphqlHTTP } = require('express-graphql');
var { buildSchema, GraphQLScalarType } = require('graphql');
const { User, Post } = require('../models');

var schema = buildSchema(`
  type Query {
    posts: [Post]
    user: User
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
  posts: async (obj, args, context) => {
    return await Post.findAll({
      where: {
        userId: args.user.id
      },
    });
  },
  user: async (obj, args, context) => {
    return await User.findOne({
      where: {
        id: args.user.id
      },
    });
  },
  createPost: async (obj, args, context) => {
    return await Post.create({userId: args.user.id, content: obj.content});
  },
  editPost: async (obj, args, context) => {
    await Post.update(
      { content: obj.content },
      {
        where: {
          id: obj.postId,
          userId: args.user.id
        },
      }
    ).catch(e => {
      // Swallow errors
      // In practice we'd want to log and monitor these errors and maybe
      // present the user with an error message
    });
    return await Post.findOne({ where: { id: obj.postId, userId: args.user.id } });
  },
  deletePost: async (obj, args, context) => {
    await Post.destroy({ where: { id: obj.postId, userId: args.user.id } });
    return postId;
  },
};

router.post(
  '/graphql',
  graphqlHTTP((req, res, graphQLParams) => {
    return {
      schema,
      rootValue: root,
      graphiql: true,
      context: {user: req.user}
    }
  })   
);


module.exports = router;