import React, { useState, useEffect } from "react";
import { Amplify, API, graphqlOperation } from "aws-amplify";
import { createBlog } from "./graphql/mutations";
import { listBlogs } from "./graphql/queries";
// material icons
import IconButton from "@mui/material/IconButton";
import FavoriteIcon from '@mui/icons-material/Favorite';
import { withAuthenticator, Button, Heading } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const initialState = { name: "", description: "", filePath: "", like: 0 };

const App = ({ signOut, user }) => {
  const [formState, setFormState] = useState(initialState);
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    fetchBlogs();
  }, []);

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value });
  }

  async function fetchBlogs() {
    try {
      const todoData = await API.graphql(graphqlOperation(listBlogs));
      const blogs = todoData.data.listBlogs.items;
      setBlogs(blogs);
      console.log(todoData)
    } catch (err) {
      console.log(err + "error fetching todos");
    }
  }

  async function addBlog() {
    try {
      if (!formState.name || !formState.description || !formState.filePath) return;
      const blog = { ...formState };
      console.log(formState)
      setBlogs([...blogs, blog]);
      setFormState(initialState);
      await API.graphql(graphqlOperation(createBlog, { input: blog }));
    } catch (err) {
      console.log("error creating todo:", err);
    }
  }
  return (
    <>
      <Heading level={1} > Hello {user.username}</Heading>
      <div style={styles.container}>
        <h2> Amplify Blog </h2>
        <input onChange={
          (event) => setInput("name", event.target.value)
        }
          style={styles.input}
          value={formState.name}
          placeholder="Name" /
        >
        <input onChange={
          (event) => setInput("filePath", event.target.value)
        }
          style={styles.input}
          value={formState.filePath}
          placeholder="filePath" /
        >
        <input onChange={
          (event) => setInput("description", event.target.value)
        }
          style={styles.input}
          value={formState.description}
          placeholder="Description" /
        >
        <button style={styles.button}
          onClick={addBlog} > Create Todo
        </button>
        {
          blogs.map((blog, index) => (
            <div key={blog.id ? blog.id : index}
              style={styles.todo} >
              <p style={styles.todoName} > {blog.name} </p>
              <p style={styles.todoDescription} > {blog.description} </p>
              <p>
                <IconButton aria-label="like" >
                  <FavoriteIcon /> {blog.like}
                </IconButton>
              </p>
            </div>
          ))
        }
      </div>
      <Button onClick={signOut} > Sign out </Button>
    </>
  );
};
const styles = {
  container: {
    width: 400,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: 20,
  },
  todo: { marginBottom: 15 },
  input: {
    border: "none",
    backgroundColor: "#ddd",
    marginBottom: 10,
    padding: 8,
    fontSize: 18,
  },
  todoName: { fontSize: 20, fontWeight: "bold" },
  todoDescription: { marginBottom: 0 },
  button: {
    backgroundColor: "black",
    color: "white",
    outline: "none",
    fontSize: 18,
    padding: "12px 0px",
  },
};

export default withAuthenticator(App);
