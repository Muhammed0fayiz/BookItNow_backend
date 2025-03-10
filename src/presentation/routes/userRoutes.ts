import { Router } from "express";
import { UserController } from "../controllers/user/user";
import { userRepository } from "../../infrastructure/repositories/user/user";
import { userUseCase } from "../../application/useCases/user/user";

import passport from "passport";
import authMiddleware from "../../shared/middlewares/authMiddleware";

const router = Router();

const repository = new userRepository();
const useCase = new userUseCase(repository);
const controller = new UserController(useCase);





router.post("/login", controller.userLogin.bind(controller));
router.post("/signup", controller.userSignup.bind(controller));
router.post("/verify-otp", controller.checkOtp.bind(controller));
router.post("/resend-otp/:email", controller.resendOtp.bind(controller));
router.get("/auth/google", (req, res, next) => {
  passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next
  );
});
router.get("/auth/google/callback",passport.authenticate("google", {
failureRedirect: "http://localhost:3000",
  }),
  controller.googleCallback.bind(controller)
);
router.get("/getWalletHistory/:id",authMiddleware,controller.walletHistory.bind(controller));

router.get("/getUser/:id",controller.getUserDetails.bind(controller));
router.put("/updateUserProfile/:id",controller.updateUserProfile.bind(controller));
router.put("/changePassword/:id",authMiddleware,controller.changePassword.bind(controller));



export default router;
