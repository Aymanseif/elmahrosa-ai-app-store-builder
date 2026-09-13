const express = require("express");
const authRouter = require("./routes/auth");
const projectRouter = require("./routes/project");
const subscriptionRouter = require("./routes/subscription");
const buildRouter = require("./routes/build");
const auditRouter = require("./routes/audit");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter);
app.use("/api/subscriptions", subscriptionRouter);
app.use("/api/builds", buildRouter);
app.use("/api/audits", auditRouter);

app.get("/", (req, res) => {
  res.json({ message: "API Core is running" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});