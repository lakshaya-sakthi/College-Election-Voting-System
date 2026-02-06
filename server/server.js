// server.js
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

/* =======================
   DATABASE CONNECTION
======================= */
mongoose.connect("mongodb://127.0.0.1:27017/college_election")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

/* =======================
   SCHEMAS & MODELS
======================= */
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["admin", "voter"], default: "voter" }
});

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

const ElectionSchema = new mongoose.Schema({
  active: { type: Boolean, default: false }
});

const PositionSchema = new mongoose.Schema({
  name: String
});

const CandidateSchema = new mongoose.Schema({
  name: String,
  photo: String,
  description: String,
  position: { type: mongoose.Schema.Types.ObjectId, ref: "Position" },
  votes: { type: Number, default: 0 }
});

const VoteSchema = new mongoose.Schema({
  voter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  position: { type: mongoose.Schema.Types.ObjectId, ref: "Position" }
});
VoteSchema.index({ voter: 1, position: 1 }, { unique: true });

const User = mongoose.model("User", UserSchema);
const Election = mongoose.model("Election", ElectionSchema);
const Position = mongoose.model("Position", PositionSchema);
const Candidate = mongoose.model("Candidate", CandidateSchema);
const Vote = mongoose.model("Vote", VoteSchema);

/* =======================
   MIDDLEWARE
======================= */
const JWT_SECRET = "SECRET_KEY";

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.sendStatus(403);
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") return res.sendStatus(403);
  next();
};

/* =======================
   AUTH ROUTES
======================= */
// Register user/admin
app.post("/api/register", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json({ msg: "Registered successfully" });
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await bcrypt.compare(req.body.password, user.password)))
      return res.status(401).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "12h" });
    res.json({ token, role: user.role });
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

/* =======================
   ADMIN – ELECTION CONTROL
======================= */
app.post("/api/admin/start", auth, adminOnly, async (req, res) => {
  await Election.findOneAndUpdate({}, { active: true }, { upsert: true });
  res.json({ msg: "Election started" });
});

app.post("/api/admin/stop", auth, adminOnly, async (req, res) => {
  await Election.findOneAndUpdate({}, { active: false });
  res.json({ msg: "Election stopped" });
});

app.post("/api/admin/reset", auth, adminOnly, async (req, res) => {
  await Vote.deleteMany({});
  await Candidate.updateMany({}, { votes: 0 });
  res.json({ msg: "Election reset completed" });
});

/* =======================
   ADMIN – POSITION CRUD
======================= */
app.post("/api/admin/positions", auth, adminOnly, async (req, res) => {
  const position = await Position.create(req.body);
  res.json(position);
});

// Get all positions for admin
app.get("/api/admin/positions", auth, adminOnly, async (req, res) => {
  const positions = await Position.find();
  res.json(positions);
});

app.delete("/api/admin/positions/:id", auth, adminOnly, async (req, res) => {
  await Candidate.deleteMany({ position: req.params.id });
  await Position.findByIdAndDelete(req.params.id);
  res.json({ msg: "Position & candidates deleted" });
});

/* =======================
   ADMIN – CANDIDATE CRUD
======================= */
app.get("/api/admin/candidates", auth, adminOnly, async (req, res) => {
  const candidates = await Candidate.find().populate("position");
  res.json(candidates);
});

app.post("/api/admin/candidates", auth, adminOnly, async (req, res) => {
  const candidate = await Candidate.create(req.body);
  res.json(candidate);
});

app.put("/api/admin/candidates/:id", auth, adminOnly, async (req, res) => {
  const updated = await Candidate.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

app.delete("/api/admin/candidates/:id", auth, adminOnly, async (req, res) => {
  await Candidate.findByIdAndDelete(req.params.id);
  res.json({ msg: "Candidate deleted" });
});

/* =======================
   VOTER – VIEW CANDIDATES
======================= */
app.get("/api/vote/candidates", auth, async (req, res) => {
  const election = await Election.findOne();
  if (!election?.active)
    return res.status(403).json({ msg: "Election not active" });

  const candidates = await Candidate.find().populate("position");
  res.json(candidates);
});

/* =======================
   VOTER – CAST VOTE
======================= */
app.post("/api/vote/:candidateId", auth, async (req, res) => {
  const election = await Election.findOne();
  if (!election?.active)
    return res.status(403).json({ msg: "Election not active" });

  const candidate = await Candidate.findById(req.params.candidateId);
  if (!candidate) return res.sendStatus(404);

  try {
    await Vote.create({ voter: req.user.id, position: candidate.position });
    candidate.votes += 1;
    await candidate.save();
    res.json({ msg: "Vote cast successfully" });
  } catch {
    res.status(400).json({ msg: "Already voted for this position" });
  }
});

/* =======================
   RESULTS – POST ELECTION
======================= */
app.get("/api/results", auth, async (req, res) => {
  const election = await Election.findOne();
  if (election?.active)
    return res.status(403).json({ msg: "Results hidden during election" });

  const positions = await Position.find();
  const results = [];

  for (const pos of positions) {
    const candidates = await Candidate.find({ position: pos._id });
    const winner = candidates.reduce((a, b) => (b.votes > (a?.votes || 0) ? b : a), null);

    results.push({
      position: pos.name,
      winner: winner ? { name: winner.name, votes: winner.votes } : null,
      candidates
    });
  }

  res.json(results);
});

/* =======================
   SERVER START
======================= */
app.listen(5000, () => console.log("Server running on port 5000"));
