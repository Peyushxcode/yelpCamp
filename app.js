if(process.env.NODE_ENV !=="production"){
    require('dotenv').config();
}

const express = require('express')
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const { campgroundSchema } = require('./schemas.js');
const { reviewSchema } = require('./schemas.js');
const Review = require('./models/review')
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');

const campgroundRoutes = require('./routers/campground')
const reviewRoutes = require('./routers/review')
const userRoutes = require('./routers/users')
const PORT = process.env.PORT || 3000 ;
// const dbUrl = process.env.DB_URL
// const dbUrl = process.env.DB_URL ||'mongodb://localhost:27017/yelp-camp'
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
// 'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl)
    .then(() => {
        console.log("MONGO Open connection");
    })
    .catch(err => {
        console.log("OH NO MONGO Error !!");
        console.log(err);
    })

//<---Colt's Code--->
//const db = mongoose.connection;
//db.on("error",console.error.bind(console, "connection error:")) ;
//db.once("open", () =. {
// console.log("Databse connection")}); 

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    // "https://api.tiles.mapbox.com/",
    // "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    // "https://api.mapbox.com/",
    // "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const connectSrcUrls = [
    // "https://api.mapbox.com/",
    // "https://a.tiles.mapbox.com/",
    // "https://b.tiles.mapbox.com/",
    // "https://events.mapbox.com/",
    "https://api.maptiler.com/", // add this
];

const fontSrcUrls = [] ;

app.use(
    helmet.contentSecurityPolicy({
        directives:{
            defaultSrc:[],
            connectSrc:["'self'", ...connectSrcUrls],
            scriptSrc:["'unsafe-inline'","'self'",...scriptSrcUrls],
            styleSrc:["'self'","'unsafe-inline'",...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc:[],
            imgSrc:[
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dbkx46l2t/",
                "https://images.unsplash.com/",
                "https://api.maptiler.com/", // add this
            ],
            fontSrc:["'self'",...fontSrcUrls],
        },
    })
);

const secret = process.env.SECRET || 'thisshouldbeabettersecret!'

const store = MongoStore.create({
    mongoUrl: dbUrl,
    
    touchAfter: 24 * 60 * 60,
    //touchafter prevents unnecessary resaves where the data in session has not changed(hr baar refresh pe change na kre)
    //hrr 24 ghnte mein krle...24*60*60
    crypto: {
        secret
    }
}) 
store.on("error",function(e) {
    console.log("Session store error",e)
} )

const sessionConfig = {
    store:store,
    name:"session",
    secret,
    resave:false,
    saveUninitialized:true,
    cookie: {
        httpOnly: true,
        //secure:true,
        expires: Date.now() + 1000*60*60*24*7 , //since Date.now is in milliseconds and we want to expire our cookie after a week !
        maxAge: 1000*60*60*24*7 
    }
}
app.use(session(sessionConfig))
app.use(flash());
//hmaein app.use(session) ....app.use(passort.session) se phle lena hai !
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next) => { 
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
})

app.get('/fakeUser', async(req,res) => {
    const user= new User({
        email:'peyyush@gmail.com',
        username:'peyushSharma'
    })
    const newUser = await User.register(user,'chicken');
    res.send(newUser);
})

//Below code is to debug the routes ! to know what method and path is triggerred on making a request from browser.
//also using console.log(sending response..) helps us too...
// app.use((req, res, next) => {
//     console.log(`Path: ${req.path} , Method : ${req.method}`);
//     next();
// });


app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/',userRoutes);

app.get('/', (req, res) => {
    res.render('home');
   // console.log('Sending response...');
})

app.all('*', (req, res, next) => {

    next(new ExpressError('Page not found', 404));
})

app.use((err, req, res, next) => {
    // req.flash('error', 'Error guys !')
    const { statusCode = 500} = err;
    if(!err.message) err.message = 'Oh no , something went wrong';
    res.status(statusCode).render('error' , { err });
})



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})