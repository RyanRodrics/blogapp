// Carregando módulos
import express from 'express';
import { engine } from 'express-handlebars';
//const bodyParser = require('body-parser');
import mongoose from 'mongoose';
import admin from './routes/admin.js';
import usuarios from './routes/usuario.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import session from 'express-session';
import flash from 'connect-flash';
import  "./models/Postagem.js";
import "./models/Categorias.js";
import passport from 'passport';
import auth from './config/auth.js';
auth(passport);
const Postagem = mongoose.model("postagens");
const Categoria = mongoose.model("categorias");
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Configurações
app.use(express.urlencoded({extended: true}));
app.use(express.json());
// Sessão
app.use(session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// Midwares
app.use((req, res , next) =>{
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null;
    next();
});
// Handlebars
app.engine('handlebars', engine({defaultLayout: 'main', runtimeOptions: {
    allowProtoPropertiesBydefault: true, allowProtoMethodsByDefault: true
}}));
app.set('view engine', 'handlebars');
app.set('views', './views');
//Mongoose
mongoose.Promise = global.Promise;
/*mongoose.connect("mongodb://localhost/blogapp").then(() =>{
    console.log("Conectado ao mongo");
}).catch((err) =>{
    console.log("Erro ao se conectar ao mongo" + err);
});*/
const connectDatabase = () =>{
    console.log("Esperando conectar com atlas...");

    mongoose.connect(
        "mongodb+srv://ryanadmin:Ryan_1534@blogapp0.utg9jid.mongodb.net/"
    ).then(() =>{
        console.log("Conectado com o atlas ");
    }).catch((error) =>{
        console.log("Erro ao conectar com o atlas: " + error);
    });
};
connectDatabase();
// Public
app.use(express.static(path.join(__dirname, "public")));



// Rotas
app.get('/', (req, res) =>{
    Postagem.find().lean().populate("categoria").sort({date: 'desc'}).then((postagens) =>{
        res.render("index", {postagens})
    }).catch((err) =>{
        req.flash('error_msg', "Houve um erro ao listar as postagens");
        res.redirect("/404");
        console.log("Erro: " + err);       
    })
})

app.get('/postagem/:slug', (req, res) =>{
    Postagem.findOne({slug: req.params.slug}).lean().then((postagem) =>{
        if(postagem){
            res.render("postagem/index", {postagem});
        } else {
            req.flash('error_msg', "Essa postagem não existe");
            res.redirect("/");
        }
    }).catch((err) =>{       
        res.redirect("/404");
        console.log("Erro: " + err);   
    })
})

app.get("/categorias", (req, res) =>{
    Categoria.find().lean().then((categorias) =>{
        res.render("categorias/index", {categorias});
    }).catch((err) =>{
        req.flash('error_msg', "Houve um erro ao listar as categorias");
        res.redirect("/404");
        console.log("Erro: " + err);   
    })
})

app.get("/categorias/:slug", (req, res) =>{
    Categoria.findOne({slug: req.params.slug}).lean().then((categoria) =>{
        if(categoria) {
            Postagem.find({categoria: categoria._id}).lean().then((postagens) =>{
                res.render("categorias/postagens", {postagens: postagens, categoria: categoria});
            }).catch((err) =>{
                req.flash('error_msg', "Houve um erro ao listar as postagens");
                res.redirect("/");
                console.log("Erro: " + err); 
            })
        } else {
            req.flash('error_msg', "Erro ao procurar categoria");
            res.redirect("/")
        }
    }).catch((err) =>{
        req.flash('error_msg', "Houve um erro ao listar as categorias");
        res.redirect("/404");
        console.log("Erro: " + err);       
    })
})

app.get('/404', (req, res) =>{
    res.send("Erro 404!");
})

app.use('/admin', admin)
app.use('/usuarios', usuarios);

// Outros
const PORT = process.env.PORT || 8081;
app.listen(PORT, () =>{
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
