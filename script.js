const express = require("express");
const { describe, todo } = require("node:test");
const app = express();
const port = 3000;
const jwt = require("jsonwebtoken");
const JWT_SECRET = "NoobHunBhai"
const cors = require("cors")

app.use(cors());
app.use(express.json())

//all the users data
let users = [
  {
    username: "user1",
    password: "password",
    todos: [{
      id: 1,
      description: "go to clg",
      status: false
    },{
      id: 2,
      description: "attend the lecture",
      status: false
    }]
  }
];


//signup page
app.post("/signup", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  if(!username || !password){
    res.json({
      message: "please provide the username and password"
    })
    return; 
  }
  
  const user = users.find(u => u.username === username)

  if(user){
    res.json({
      message: "user already exists"
    })
  }
  else{
    users.push({
      username: username,
      password: password,
      todos: []
    })
    res.json({
      message: "user signed up successfully"
    })
  }
})


//signin page
app.post("/signin", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  if(!username || !password){
    res.json({
      message: "please provide the username and password for signing in"
    })
    return;
  }

  const user = users.find(u => u.username === username && u.password === password)
  if(user){
    const token = jwt.sign({
      username: username
    },JWT_SECRET)
    res.json({
      token: token
    })
  }
  else{
    res.json({
      message: "user does not exit"
    })
  }
})

//auth middleware
function auth(req, res, next){
  const token = req.headers.token;
  const decodedUser = jwt.verify(token, JWT_SECRET);

  if(decodedUser){
    req.user = decodedUser
    next();
  }
  else{
    res.json({
      message: "credentials are incorrect"
    })
  }
}

//get all the todos of the particular user using token
app.get("/me/todos", auth, function (req, res) {
  const user = req.user;
  const foundUser = users.find(u => u.username === user.username)

  if(foundUser){
    res.json({
      todos: foundUser.todos
    })
  }
  else{
    res.json({
      message: "user does not exists"
    })
  }
})

//add the todos of a new user
app.post("/me/todos",auth, function (req, res) {
  const user = req.user;
  const description = req.body.description;
  const foundUser = users.find(u => u.username === user.username)

  if(foundUser){
    newtodo = {
      id: foundUser.todos.length + 1,
      description: description,
      status: false
    }
    foundUser.todos.push(newtodo);
    res.json({
      message: "new todo added successfully"
    })
    return;
  }
  else{
    res.json({
      message: "user does not exists"
    })
  }
})

//update the todos of the existing user
app.put("/me/todos/:id", auth, function(req, res) {
  const id = parseInt(req.params.id);
  const user = req.user;
  const description = req.body.description;
  const status = req.body.status;
  if(!description && !status){
    res.json({
      message: "please provide the description and status of the todo to be"
    })
    return;
  }

  const foundUser = users.find(u => u.username === user.username)

  if(foundUser){
    const foundId = foundUser.todos.find(i => i.id === id)
    if(foundId){
      if(description){
        foundId.description = description;
      }
      if(!status){
        foundId.status = false;
        res.json({
          message: "todo updated"
        })
        return;
      }
      
      foundId.status = status;
      res.json({
        message: "todo updated"
      })
    }
    else{
      res.json({
        message: "todo does not exists"
      })
      return;
    }
  }
  else{
    res.json({
      message: "user does not exists"
    })
    return;
  }
})

//delete a particular todo of the user
app.delete("/me/todos/:id", auth, function (req, res){
  const id = parseInt(req.params.id);
  const user = req.user;
  const foundUser = users.find(u => u.username === user.username)

  if(foundUser){
    const foundIndex = foundUser.todos.findIndex(i => i.id === id)
    if(foundIndex !== -1){
      foundUser.todos.splice(foundIndex,1)
      res.json({
        message: "todo deleted of the given id"
      })
      return;
    }
    else{
      res.json({
        message: "todo not found of the given id"
      })
      return;
    }
  }
  else{
    res.json({
      message: "user not found"
    })
    return;
  }
})

app.listen(port, () => {
  console.log("app is listening on port:", port);
})