// in controllers/stuff.js

const Sauce = require("../models/sauce");
const fs = require("fs");

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);

    delete sauceObject._id;

    delete sauceObject._userId;

    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,

        imageUrl: `${req.protocol}://${req.get("host")}/images/${
            req.file.filename
        }`,
        usersLiked: [],
        usersDisliked: [],
    });
    sauce
        .save()
        .then(() => res.status(201).json({ message: "Sauce enregistré !" }))
        .catch((error) => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
        _id: req.params.id,
    })
        .then((sauce) => {
            res.status(200).json(sauce);
        })
        .catch((error) => {
            res.status(404).json({
                error: error,
            });
        });
};

exports.modifySauce = (req, res, next) => {
    //verifier si une image à été téléchargée dans la demande
    const sauceObject = req.file
        ? //Si une image à été téléchargée, ajouter la propriété imageUrl à sauceObject
          {
              ...JSON.parse(req.body.sauce), //répandre le contenu de  req.body.sauce dans l'objet
              imageUrl: `${req.protocol}://${req.get("host")}/images/${
                  req.file.filename
              }`, //construire l'imageUrl à partir de req.protocol, req.get('host') et req.file.filename
          }
        : //Si aucune image n'a été téléchargée, diffusez simplement le contenu de req.body dans sauceObject
          { ...req.body };
    // Supprimer la prorpiété _userId de sauceObject
    delete sauceObject._userId;

    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            // Vérifier si l'utilisateur authentifié est le propriétaire de la sauce
            if (sauce.userId != req.auth.userId) {
                // Sinon, retourner un statut 401 avec un message "Non-autorisé".
                res.status(401).json({ message: "Non-autorisé" });
            } else {
                //Si l'utilisateur est le propriétaire de la sauce, supprimer l'image précédente
                fs.unlink(
                    `images/${sauce.imageUrl.split("/images/")[1]}`,
                    (error) => {
                        if (error) {
                            console.error(error);
                        }
                    } );
                //Si l'utilisateur est le propriétaire de la sauce, mettre à jour la sauce dans la database avec sauceObject
                Sauce.updateOne(
                    { _id: req.params.id },
                    { ...sauceObject, _id: req.params.id }
                )
                    .then(() =>
                        res.status(200).json({ message: "Sauce modifié!" })
                    )
                    .catch((error) => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: "Not authorized" });
            } else {
                const filename = sauce.imageUrl.split("/images/")[1];
                fs.unlink(`images/${filename}`, () => {
                    sauce
                        .deleteOne({ _id: req.params.id })
                        .then(() => {
                            res.status(200).json({
                                message: "Objet supprimé !",
                            });
                        })
                        .catch((error) => res.status(401).json({ error }));
                });
            }
        })
        .catch((error) => {
            res.status(401).json({ error });
        });
};
exports.getAllSauce = (req, res, next) => {
    Sauce.find()
        .then((sauces) => {
            res.status(200).json(sauces);
        })
        .catch((error) => {
            res.status(400).json({
                error: error,
            });
        });
};

exports.likeSauce = (req, res, next) => {
    // Obtenir la valeur de like du corps de la requête
    const { like } = req.body;
    // Obtenir l'ID de l'utilisateur à partir de la requête
    const userId = req.auth.userId;

    //Trouver la sauce via l'ID dans la dataase
    Sauce.findOne({ _id: req.params.id }).then((sauce) => {
        //Vérifier si l'utilisateur à liker
        if (like == 1) {
            //Vérifier si l'utilisateur à déjà liker la sauce
            if (sauce.usersLiked.includes(userId)) {
                return res
                    .status(400)
                    .json({ message: "Vous avez déjà liker cette sauce!" });
            } else if (sauce.usersDisliked.includes(userId)) {
                //Si l'utilisateur n'a pas liker la sauce, supprimez son ID du tableau
                const index = sauce.usersDisliked.indexOf(userId);
                sauce.usersDisliked.splice(index, 1);
                sauce.dislikes -= 1;
            }
            //Ajouter l'ID de l'utilisateur au tableau
            sauce.usersLiked.push(userId);
            sauce.likes += 1;
        } else if (like == -1) {
            //Verifier si l'utilisateur n'a pas déjà disliker la sauce
            if (sauce.usersDisliked.includes(userId)) {
                return res
                    .status(400)
                    .json({ message: "Vous avez déjà dislker cette sauce!" });
            } else if (sauce.usersLiked.includes(userId)) {
                //Si l'utilisateur a liker la sauce, supprimez son ID du tableau
                const index = sauce.usersLiked.indexOf(userId);
                sauce.usersLiked.splice(index, 1);
                sauce.likes -= 1;
            }

            //Ajouter l'ID de l'utilisateur au tableau usersDisliked
            sauce.usersDisliked.push(userId);
            sauce.dislikes += 1;
        } else if (like == 0) {
            //Si l'utilisateur souhaite supprimer ce qu'il aime ou n'aime pas
            if (sauce.usersLiked.includes(userId)) {
                //Si l'utilisateur a liker la sauce, supprimer son Id tu tableau
                const index = sauce.usersLiked.indexOf(userId);
                sauce.usersLiked.splice(index, 1);
                sauce.likes -= 1;
            } else if (sauce.usersDisliked.includes(userId)) {
                //Si l'utilisateur a disliker la sauce, supprimer son Id du tableau
                const index = sauce.usersDisliked.indexOf(userId);
                sauce.usersDisliked.splice(index, 1);
                sauce.dislikes -= 1;
            } else {
                return res
                    .status(400)
                    .json({ message: "Sauce pas encore été évaluée !" });
            }
        } else {
            //Si la valeur similaire n'est pas 1, 0 ou -1n renvoie une erreur
            return res.status(400).json({ message: "Valeur like non valide." });
        }
        //Enregistrer les informations mises à jour sur la sauce
        sauce
            .save()
            .then(() => {
                res.status(200).json({
                    message: "Le statut like mis à jour",
                    likes: sauce.likes,
                    dislikes: sauce.dislikes,
                });
            })
            .catch((error) => {
                //S'il y a une erreur, envoyez une reponse avec l'erreur
                res.status(401).json({ error });
            });
    });
};