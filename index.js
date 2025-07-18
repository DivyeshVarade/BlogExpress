// index.js
import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import path from "path";

const app = express();
const port = parseInt(process.env.PORT, 10) || 3000;

// ——— View engine & static files ———
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));
app.use(express.static(path.join(process.cwd(), "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ——— In‑memory “database” ———
let posts = [
  {
    id: 1,
    title: "The Rise of Decentralized Finance",
    content:
      "Decentralized Finance (DeFi) is an emerging field in blockchain…",
    author: "Alex Thompson",
    date: "2023-08-01T10:00:00Z",
  },
  {
    id: 2,
    title: "The Impact of Artificial Intelligence on Modern Businesses",
    content:
      "Artificial Intelligence (AI) is no longer a concept of the future…",
    author: "Mia Williams",
    date: "2023-08-05T14:30:00Z",
  },
  {
    id: 3,
    title: "Sustainable Living: Tips for an Eco-Friendly Lifestyle",
    content:
      "Sustainability is more than just a buzzword… practical tips you can adopt today.",
    author: "Samuel Green",
    date: "2023-08-10T09:15:00Z",
  },
];
let lastId = posts.length;

// ——— API routes ———
app.get("/posts", (req, res) => {
  res.json(posts);
});

app.get("/posts/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const post = posts.find((p) => p.id === id);
  if (!post) return res.status(404).json({ error: "Not found" });
  res.json(post);
});

app.post("/posts", (req, res) => {
  const { title, content, author } = req.body;
  const newPost = {
    id: ++lastId,
    title,
    content,
    author: author || "Anonymous",
    date: new Date().toISOString(),
  };
  posts.push(newPost);
  res.status(201).json(newPost);
});

app.patch("/posts/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const post = posts.find((p) => p.id === id);
  if (!post) return res.status(404).json({ error: "Not found" });
  Object.assign(post, req.body);
  res.json(post);
});

app.delete("/posts/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  posts = posts.filter((p) => p.id !== id);
  res.status(204).end();
});

// ——— Front‑end routes ———

// Home page
app.get("/", async (req, res) => {
  try {
    // same‑origin request
    const fullUrl = `${req.protocol}://${req.get("host")}/posts`;
    const { data } = await axios.get(fullUrl);
    res.render("index", { posts: data });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching posts");
  }
});

// New post form
app.get("/new", (req, res) => {
  res.render("modify", { heading: "New Post", submitText: "Create", post: null });
});

// Edit post form
app.get("/edit/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const post = posts.find((p) => p.id === id);
  if (!post) return res.status(404).send("Not found");
  res.render("modify", { heading: "Edit Post", submitText: "Update", post });
});

// Handle create
app.post("/new", (req, res) => {
  const { title, content, author } = req.body;
  const newPost = {
    id: ++lastId,
    title,
    content,
    author: author || "Anonymous",
    date: new Date().toISOString(),
  };
  posts.push(newPost);
  res.redirect("/");
});

// Handle update
app.post("/edit/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const post = posts.find((p) => p.id === id);
  if (post) Object.assign(post, req.body);
  res.redirect("/");
});

// Handle delete
app.get("/delete/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  posts = posts.filter((p) => p.id !== id);
  res.redirect("/");
});

// ——— Start server ———
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
