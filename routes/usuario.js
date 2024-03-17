import express from 'express';
const router = express.Router();
import mongoose from 'mongoose';
import "../models/Usuario.js";
const Usuario = mongoose.model("usuarios");
import bcrypt from "bcryptjs";
import passport from 'passport';

router.get('/registro', (req, res) =>{
    res.render("usuarios/registro");
})

router.post('/registro', (req, res)=>{
    let erros = [];

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({texto: "Nome inválido"});
    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({texto: "Email inválido"});
    }
    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({texto: "Senha inválido"});
    }
    if (req.body.senha.length < 4) {
        erros.push({texto: "Senha muito curta"});
    }
    if (req.body.senha != req.body.senha2) {
        erros.push({texto: "As senhas são diferentes, tente novamente!"});
    }

    if(erros.length > 0) {
        res.render("usuarios/registro", {erros})
    } else {
        Usuario.findOne({email: req.body.email}).lean().then((usuario) =>{
            if(usuario) {
                req.flash("error_msg", "Já existe uma conta com este e-mail no nosso sistema");
                res.redirect("/usuarios/registro");
            } else {
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })
                bcrypt.genSalt(10, (erro, salt) =>{
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) =>{
                        if(erro) {
                            console.log("Erro: " + erro)
                            req.flash("error_msg", "Houve um erro durante o salvamento do usuario");
                            res.redirect("/");
                        } else {
                            novoUsuario.senha = hash;
                            novoUsuario.save().then(() =>{
                                req.flash("success_msg", "Usuario criado com sucesso");
                                res.redirect("/");
                            }).catch((err) =>{
                                console.log("Erro: " + erro)
                                req.flash("error_msg", "Erro ao criar o usuário, tente novamente!");
                                res.redirect("/usuarios/registro");
                            })                         
                        }
                    })
                })
            }
        }).catch((err) =>{
            console.log("Erro: " + err)
            req.flash("error_msg", "Houve um erro interno");
            res.redirect("/");
        })
    }
})

router.get('/login', (req, res) =>{
    res.render("usuarios/login")
})

router.post('/login', (req, res, next) =>{
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)
})

router.get('/logout', (req, res) =>{
    req.logOut(() =>{
        req.flash("success_msg", "Deslogado com sucesso!");
        res.redirect("/");
    });
})

export default router;