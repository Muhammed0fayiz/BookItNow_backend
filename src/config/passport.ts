// import passport from "passport";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import dotenv from "dotenv";
// import { UserModel } from "../infrastructure/models/userModel";

// dotenv.config();

// const passportConfig = () => {
//   // Serialize user ID into session
//   passport.serializeUser((user: any, done) => {
//     done(null, user._id);
//   });

//   // Deserialize user ID from session
//   passport.deserializeUser(async (id: string, done) => {
//     try {
//       const user = await UserModel.findById(id);
//       done(null, user);
//     } catch (error) {
//       done(error);
//     }
//   });

//   // Configure Google Strategy
//   passport.use(
//     new GoogleStrategy(
//       {
//         callbackURL: "/auth/google/callback",
//         clientID: process.env.GOOGLE_AUTH_CLIENT_ID as string,
//         clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET as string,
//       },
//       async (profile: any, done: any) => {
//         try {
//           console.log("passport configatuation is worki");

//           let user = await UserModel.findOne({ email: profile._json.email });

//           if (user) {
//             // User already exists, return the user
//             console.log("user already exist!");
//             return done(null, user);
//           } else {
            
//             // Create a new user
//             const newUser = new UserModel({
//                 username: profile._json.given_name || "", // Ensure you handle cases where profile._json.given_name may be undefined
//                 email: profile._json.email,
//                 password: 'password', // Set the hashed password here
//                 isblocked: false,
//                 isVerified: true,
//                 profileImage: profile._json.picture || null,
//               });
//             console.log("newuser", newUser);
//             // Save the new user to the database
//             await newUser.save();
//             done(null, newUser);
//           }
//         } catch (error) {
//           done(error as Error);
//         }
//       }
//     )
//   );
// };

// export default passportConfig;


import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import { UserModel } from "../infrastructure/models/userModel";

dotenv.config();

const passportConfig = () => {
  // Serialize user ID into session
  passport.serializeUser((user: any, done) => {
    done(null, user._id);
  });

  // Deserialize user ID from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await UserModel.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Configure Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        callbackURL: "/auth/google/callback",
        clientID: process.env.GOOGLE_AUTH_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET as string,
      },
      async (accessToken, refreshToken, profile, done) => { // Corrected parameters
        try {
          console.log("passport configuration is working");

          let user = await UserModel.findOne({ email: profile._json.email });

          if (user) {
            // User already exists, return the user
            console.log("user already exists!");
            return done(null, user);
          } else {
            // Create a new user
            const newUser = new UserModel({
              username: profile._json.given_name || "", // Ensure you handle cases where profile._json.given_name may be undefined
              email: profile._json.email,
              password: 'password', // Set the hashed password here
              isblocked: false,
              isVerified: true,
              profileImage: profile._json.picture || null,
            });
            console.log("new user", newUser);

            // Save the new user to the database
            await newUser.save();
            done(null, newUser);
          }
        } catch (error) {
          done(error as Error);
        }
      }
    )
  );
};

export default passportConfig;
