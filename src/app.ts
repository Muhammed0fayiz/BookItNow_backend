// import express from "express";
// import cors from "cors";
// import passportConfig from "./config/passport";
// import passport from "passport";
// import session from "express-session";
// import cookieParser from 'cookie-parser'

// passportConfig()

// const app = express();
// app.use(cookieParser())
// app.use(
//   session({
//     secret: 'your-secret-key',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false },
//   })
// );

// const allowedOrigins = ["http://localhost:3000"];
// const corsOptions = {
//   origin: allowedOrigins,
//   optionsSuccessStatus: 200,
//   credentials: true,
// };
// app.use(cors(corsOptions));
// app.options("*", cors(corsOptions));
// app.use(express.json());

// app.use(passport.initialize())
// app.use(passport.session())

// export default app;
