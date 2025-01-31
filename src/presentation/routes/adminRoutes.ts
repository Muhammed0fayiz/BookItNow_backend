import { Router } from "express";
import { adminController } from "../controllers/admin/admin";
import { adminUseCase } from "../../application/useCases/admin/admin";
import { adminRepository } from "../../infrastructure/repositories/admin/admin";
import { adminAuth } from "../../shared/middlewares/adminauth";

const session = require("express-session");
const router = Router();

// Session handling
router.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

const repository = new adminRepository();
const useCase = new adminUseCase(repository);
const controller = new adminController(useCase);

// // Public route for admin login

router.post("/loginpost", controller.loginpost.bind(controller));
router.post("/adminLogin", controller.adminLogin.bind(controller));
router.get("/checkSession", controller.checkSession.bind(controller));
router.get("/session-exists", controller.isSessionExist.bind(controller));
router.get("/details", controller.getAdminDetails.bind(controller));
router.get("/downloadReport", controller.downloadReport.bind(controller));
router.post("/adminLogout", controller.adminLogout.bind(controller));

router.use(adminAuth);

router.get("/getTempPerformers", controller.allTempPerformers.bind(controller));
router.post(
  "/grant-performer-permission/:id",
  controller.grandedPermission.bind(controller)
);
router.post(
  "/reject-performer-permission/:id",
  controller.rejectedPermission.bind(controller)
);

router.get("/performers", controller.getAllPerformers.bind(controller));
router.post(
  "/updatePerformerStatus/:id",
  controller.blockunblockperformer.bind(controller)
);

router.get("/getUsers", controller.allUsers.bind(controller));
router.post(
  "/updateUserStatus/:id",
  controller.blockunblockuser.bind(controller)
);

router.get("/getAllEvents", controller.getAllEvents.bind(controller));
router.post(
  "/blockUnblockEvents/:id",
  controller.toggleBlockStatus.bind(controller)
);

router.get("/getRevenue", controller.getRevenue.bind(controller));



export default router;
