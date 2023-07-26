// Importation de express
const express = require("express");
const mongoose = require("mongoose");
// Importation des routes
const userRoutes = require("./routes/user");
const sauceRoutes = require("./routes/sauce");

// Importation node.js utilitaire pour travailler avec les chemins de fichier
const path = require("path");
//Importer les variables d'environnement à partir du fichier .env
require("dotenv").config();

mongoose
    .connect(
        "mongodb+srv://" +
            process.env.hostName +
            ":" +
            process.env.hostMdp +
            "@" +
            process.env.hostUrl +
            "/" +
            process.env.hostConnexion,

        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    )
    .then(() => console.log("Connexion à MongoDB réussie !"))
    .catch((err) => console.log("Connexion echouer" + err));
// Création de l'application express
const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    if (req.method === "OPTIONS") {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Route d'authenfication
app.use("/api/auth", userRoutes);

// Route sauce
app.use("/api/sauces", sauceRoutes);

// Route images

app.use("/images", express.static(path.join(__dirname, "images")));

// Exportation de app.js pour pouvoir y accéder depuis un autre fichier
module.exports = app;
