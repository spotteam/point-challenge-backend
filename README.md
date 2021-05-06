## Context

The backend was built using Express.js (a Node.js web framework) and GraphQL for much of the API Layer. We are using passport.js for authentication. We use the passport-jwt strategy to sign a jwt token that is sent back to the frontend. A valid JWT token must accompany any request to access signed-in functionality. The backend is deployed at https://point-backend-saad-eswar.herokuapp.com

There are 3 API Endpoints:

* /signup
  * This endpoint accepts a POST request with a JSON body of the format: {email: example@example.com, password:$3cUr3Pa$$w0rd123 }
* /login
  * This endpoint accepts a POST request with a JSON body of the format:
    * `{email: example@example.com, password: $3cUr3Pa$$w0rd123}`
  * /secure/graphql
    * This endpoint accepts a POST request. It must have an “Authorization” header field with a value of the format: Bearer \<jwt token\>
      * \<jwt token\> should be the value of “token” returned as a response from /login. The body of this request must contain a valid GraphQL query.
    * There are 4 different GraphQL queries that are supported
      * posts - this returns all the posts for a given user
      * createPost - this takes a variable “content” and creates a post for the given user with the provided content
      * editPost - this takes a variable “content” and “postId” and updates the given post if it belongs to the given user with the provided content
      * deletePost - this takes a variable “postId” and deletes the given post if it belongs to the given user.
    * Examples:

```
query { posts { id createdAt content } }
mutation CreatePost($content: String) {
    createPost(content: $content) {
      id
      createdAt
      content
    }
  }

mutation EditPost($postId: Int, $content: String) {
    editPost(postId: $postId, content: $content) {
      id
      createdAt
      content
    }
  }

mutation DeletePost($postId: Int) {
    deletePost(postId: $postId)
  }
```

We chose to use a regular (non-GraphQL) API design for our signup and login functionality because it simplified our GraphQL logic for “secure” endpoints. Secure endpoints don’t need to have authentication information in the body of the GraphQL query. Rather, they just need a valid JWT in the authorization header to identify which user is authorizing the request.

We have two models represented in our api layer and database - User and Post.

* User represents any user that has created an account.
  * email: string value for their email. This must be unique and is enforced by our database
  * password: string value for their password. For this project, we aren’t enforcing any requirements for the password, like length or multiple character types. In a more secure system, this would be an important requirement for the security of our users’ accounts. We use a passport-local strategy to hash the password before it’s stored in our database.

* Post represents any “tweet” or post that any of our users post.
  * createdAt: timestamp for when this tweet was first published
  * content: string value representing the content of the post
  * userId: reference (foreign key in our database) to the user that created and owns this post.

## How to Run

To run the backend locally, follow these steps:  

`git clone https://github.com/spotteam/point-challenge-backend.git`  
`cd point-challenge-backend`  
`npm i`  
`npm i -g nodemon`  
`./node_modules/.bin/sequelize-cli db:migrate`  
`nodemon server.js`  

Your server should be running at port 8080 or whatever port was set as your environment variable, if any.
