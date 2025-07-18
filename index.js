// index.js
import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = parseInt(process.env.PORT, 10) || 3000;

// In‑memory “database”
let posts = [
  { id: 1, title: "First Post", content: "Hello, world!" },
  { id: 2, title: "Second Post", content: "Express on Vercel." }
];
let lastId = posts.length;

// View engine & static files
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// —— API routes ——

// Get all posts
app.get("/posts", (req, res) => {
  res.json(posts);
});

// Get a single post
app.get("/posts/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const post = posts.find(p => p.id === id);
  return post ? res.json(post) : res.status(404).json({ error: "Not found" });
});

// Create a new post
app.post("/posts", (req, res) => {
  const { title, content } = req.body;
  const newPost = { id: ++lastId, title, content };
  posts.push(newPost);
  res.status(201).json(newPost);
});

// Update a post
app.patch("/posts/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const post = posts.find(p => p.id === id);
  if (!post) return res.status(404).json({ error: "Not found" });
  Object.assign(post, req.body);
  res.json(post);
});

// Delete a post
app.delete("/posts/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  posts = posts.filter(p => p.id !== id);
  res.status(204).end();
});

// —— Front‑end routes ——

// Home page: fetches posts from the above API
app.get("/", async (req, res) => {
  try {
    const apiUrl = `${req.protocol}://${req.get("host")}/posts`;
    const response = await axios.get(apiUrl);
    res.render("index.ejs", { posts: response.data });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching posts");
  }
});

// New post form
app.get("/new", (req, res) => {
  res.render("new.ejs");
});

// Edit post form
app.get("/edit/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const post = posts.find(p => p.id === id);
  if (!post) return res.status(404).send("Not found");
  res.render("edit.ejs", { post });
});

// Form handlers (you can also switch these to API-style if you prefer)
app.post("/new", (req, res) => {
  const { title, content } = req.body;
  const newPost = { id: ++lastId, title, content };
  posts.push(newPost);
  res.redirect("/");
});

app.post("/edit/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const post = posts.find(p => p.id === id);
  if (post) Object.assign(post, req.body);
  res.redirect("/");
});

app.get("/delete/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  posts = posts.filter(p => p.id !== id);
  res.redirect("/");
});

// Start server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
