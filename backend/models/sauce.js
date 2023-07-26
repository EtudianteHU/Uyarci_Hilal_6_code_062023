const mongoose = require("mongoose");

const sauceSchema = mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    description: { type: String, required: true },
    mainPepper: { type: String, required: true },
    imageUrl: { type: String, required: true },
    heat: { type: Number, required: true },
    likes: { type: Number, default: 0 }, // on met pas required ici car la valeur n'est pas demander a la creation de la sauce mais elle est donne par defaut a 0
    dislikes: { type: Number,  default: 0}, // d'ou le "default: 0"
    usersLiked: [{ type: String }], // pareil ici on met un trableau vide par default
    usersDisliked: [{ type: String }],
});

module.exports = mongoose.model("Sauce", sauceSchema);
