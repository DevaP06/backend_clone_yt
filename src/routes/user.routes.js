import { Router } from "express";   
import { registerUser } from "../controllers/user.controller.js";
import { loginUser, logoutUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js";
const router = Router();

router.route("/register").post(
    upload.fields(
        [
            {
                name: "avatar",
                maxCount:1
            },
            {
                name: "coverImage",
                maxCount:2
            },
        ]
    ),
    registerUser);


router.route('/login').post(loginUser);

//secured routes
router.route('/logout').post(verifyJWT, logoutUser);


export default router;