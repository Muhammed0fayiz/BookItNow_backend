import { Router } from "express";
import { UserController } from "../controllers/userController";
import { userRepository } from "../../infrastructure/repositories/user";
import { userUseCase } from "../../application/useCases/user";
import authenticateJWT from "../../shared/middlewares/authentication";
import { performerRepository } from "../../infrastructure/repositories/performer";
import { performerUseCase } from "../../application/useCases/performer";
import { performerController } from "../controllers/performerController";
import path from "path";
import multer from "multer";

const upload = multer();

const router = Router();

const repository = new performerRepository();

const useCase = new performerUseCase(repository);

const controller = new performerController(useCase);

// Define storage configuration for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../../../frontend/public/uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Initialize multer with the defined storage
const uploads = multer({ storage: storage });



router.get("/getPerformer/:id", controller.getPerformerDetails.bind(controller));
router.post(
  "/tempPerformer",
  upload.single("video"),
  controller.addTempPerformer.bind(controller)
);

router.post("/performerlogin", controller.performerLogin.bind(controller));


router.put(
  "/updatePerformerProfile/:id",
  uploads.single("image"), // Ensure to use multer for file upload
  controller.updatePerformerProfile.bind(controller) // Bind the controller method
);

// router.post('/uploadEvents/:id',
//   uploads.single('eventsImage'),controller.uploadEvents.bind(controller))

export default router;