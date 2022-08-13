const express = require("express");
const path = require("path");
const handlebars = require("express-handlebars");
const homeRoute = require("./routes/home");
const addRoute = require("./routes/add");
const coursesRoute = require("./routes/courses");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);
const varMiddleware = require("./middleware/variabels");
const userMiddleware = require("./middleware/user");
const errorPageMiddleware = require("./middleware/404");
const fileMiddleware = require("./middleware/file");
const mongoose = require("mongoose");
const csrf = require("csurf");
const flash = require("connect-flash");
const keys = require("./keys");

const MONGODB_URL = keys.MONGO;

const app = express();

const hbs = handlebars.create({
  defaultLayout: "main",
  extname: "hbs",
  helpers: require("./utils/hbs_helpers"),
});

const store = new MongoStore({
  collection: "sessions",
  uri: MONGODB_URL,
});

app.engine("hbs", hbs.engine);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/assets/images",
  express.static(path.join(__dirname, "assets/images"))
);
app.use(
  session({
    secret: keys.SESSION,
    resave: false,
    saveUninitialized: false,
    store,
  })
);

app.use(fileMiddleware.single("avatar"));
app.use(csrf());
app.use(flash());
app.use(varMiddleware);
app.use(userMiddleware);

app.set("view engine", "hbs");
app.set("views", "views");

app.use("/", homeRoute);
app.use("/add", addRoute);
app.use("/courses", coursesRoute);
app.use("/cart", cartRoutes);
app.use("/order", orderRoutes);
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

app.use(errorPageMiddleware);

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await mongoose.connect(MONGODB_URL, {
      useNewUrlParser: true,
    });
  } catch (e) {
    console.log(e);
  }

  app.listen(PORT, () => {
    console.log("server is running", PORT);
  });
}

start();
