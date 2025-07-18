// index.js
import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import path from "path";

const app = express();

// ——— View engine & static files ———
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));
app.use(express.static(path.join(process.cwd(), "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ——— In-memory “database” ———
let posts = [
  { id: 1, title: "First Post", content: "Hello, world!", author: "Alice", date: "2023-08-01T10:00:00Z" },
  { id: 2, title: "Second Post", content: "Express on Vercel.", author: "Bob", date: "2023-08-05T14:30:00Z" },
];
let lastId = posts.length;

// ——— API routes ———
app.get("/posts", (req, res) => res.json(posts));

app.get("/posts/:id", (req, res) => {
  const id = +req.params.id;
  const p = posts.find(x => x.id === id);
  return p ? res.json(p) : res.status(404).json({ error: "Not found" });
});

app.post("/posts", (req, res) => {
  const { title, content, author } = req.body;
  const newPost = { id: ++lastId, title, content, author: author||"Anonymous", date: new Date().toISOString() };
  posts.push(newPost);
  res.status(201).json(newPost);
});

app.patch("/posts/:id", (req, res) => {
  const id = +req.params.id;
  const p = posts.find(x => x.id === id);
  if (!p) return res.status(404).json({ error: "Not found" });
  Object.assign(p, req.body);
  res.json(p);
});

app.delete("/posts/:id", (req, res) => {
  const id = +req.params.id;
  posts = posts.filter(x => x.id !== id);
  res.status(204).end();
});

// ——— Front-end routes ———
app.get("/", async (req, res) => {
  try {
    const url = `${req.protocol}://${req.get("host")}/posts`;
    const { data } = await axios.get(url);
    res.render("index", { posts: data });
  } catch (e) {
    console.error(e);
    res.status(500).send("Error fetching posts");
  }
});

app.get("/new", (req, res) =>
  res.render("modify", { heading: "New Post", submitText: "Create", post: null })
);

app.get("/edit/:id", (req, res) => {
  const id = +req.params.id;
  const p = posts.find(x => x.id === id);
  if (!p) return res.status(404).send("Not found");
  res.render("modify", { heading: "Edit Post", submitText: "Update", post: p });
});

app.post("/new", (req, res) => {
  const { title, content, author } = req.body;
  posts.push({ id: ++lastId, title, content, author: author||"Anonymous", date: new Date().toISOString() });
  res.redirect("/");
});

app.post("/edit/:id", (req, res) => {
  const id = +req.params.id;
  const p = posts.find(x => x.id === id);
  if (p) Object.assign(p, req.body);
  res.redirect("/");
});

app.get("/delete/:id", (req, res) => {
  const id = +req.params.id;
  posts = posts.filter(x => x.id !== id);
  res.redirect("/");
});

// ——— Export for Vercel ———
export default app;
