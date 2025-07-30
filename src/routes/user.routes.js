import { Router } from "express";   
// import { registerUser } from "../controllers/user.controller.js";
// import { loginUser, logoutUser,registerUser,refreshAccesstoken,updateUserCoverImage, } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js";
// import { refreshAccesstoken } from "../controllers/user.controller.js";
import {registerUser,loginUser,changeCurrentPassword,getCurrentuser,getUserChannelProfile,getWatchHistory,logoutUser,refreshAccesstoken,updatUserAvatar,updateAccountDetails,updateUserCoverImage} from "../controllers/user.controller.js";
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
router.route('/refresh-token').post(refreshAccesstoken);
router.route('/change-password').post(verifyJWT, changeCurrentPassword);
router.route('/current-user').get(verifyJWT, getCurrentuser);
router.route('/update-account-details').put(verifyJWT, updateAccountDetails);
router.route('/update-avatar').patch(verifyJWT, upload.single('avatar'), updatUserAvatar);
router.route('/update-cover-image').patch(verifyJWT, upload.single('coverImage'), updateUserCoverImage);
router.route('/c/:username').get(verifyJWT, getUserChannelProfile);
router.route('/watch-history').get(verifyJWT, getWatchHistory);



export default router;