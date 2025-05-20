const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const setupCronJobs = require('./app/jobs/EnqueteCronJob');
setupCronJobs();



var corsOptions = {
  origin: ["http://localhost:4200"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");

//static Images Folder
app.use("/Images", express.static("./Images"));
app.use(express.static(path.join(__dirname, "static")));

db.sequelize.sync();

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Enquette application." });
});

require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/entreprise.routes")(app);
require("./app/routes/enquete.routes")(app);
require("./app/routes/question.routes")(app);
require("./app/routes/reponse.routes")(app);

require("./app/routes/Stats.admin.routes")(app);
require("./app/routes/Stats.entreprise.routes")(app);



const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
