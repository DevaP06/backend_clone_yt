import asyncHandler from "express-async-handler";

const registerUser = asyncHandler(async (req, res) => {
    // Registration logic here
    res.status(200).json({ 
        message: "User registered successfully" });
})

    

export { registerUser };