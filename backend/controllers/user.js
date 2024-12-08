const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.signUp = (req, res, next) => {
    // Vérifier que le mot de passe est fourni et qu'il a au moins 10 caractères
    if (!req.body.password || req.body.password.length < 10) {
        return res.status(400).json({
            message: "Le mot de passe doit contenir au moins 10 caractères."
        });
    }
    
    bcrypt
        .hash(req.body.password, 10)
        .then((hash) => {
            const user = new User({
                email: req.body.email,
                password: hash,
            });
            user.save()
                .then(() =>
                    res.status(201).json({ message: "Utilisateur créé !" })
                )
                .catch((error) => res.status(400).json({ error }));
        })
        .catch((error) => res.status(500).json({ error }));
};

exports.logIn = (req, res, next) => {
    // Vérifier que le mot de passe est fourni et qu'il a au moins 10 caractères
    if (!req.body.email || !req.body.password || req.body.password.length < 10) {
        return res.status(400).json({
            message: "Le mot de passe doit contenir au moins 10 caractères."
        });
    }

    User.findOne({ email: req.body.email })
        .then((user) => {
            if (!user) {
                return res
                    .status(401)
                    .json({ message: "Paire login/mot de passe incorrecte" });
            }
            bcrypt
                .compare(req.body.password, user.password)
                .then((valid) => {
                    if (!valid) {
                        return res
                            .status(401)
                            .json({
                                message: "Paire login/mot de passe incorrecte",
                            });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            "RANDOM_TOKEN_SECRET",
                            { expiresIn: "24h" }
                        ),
                    });
                })
                .catch((error) => res.status(500).json({ error }));
        })
        .catch((error) => res.status(500).json({ error }));
};
