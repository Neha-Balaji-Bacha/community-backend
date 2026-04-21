import multer from "multer";

//Store files on disk (server folder), not in memory.
const storage = multer.diskStorage({
    //This function decides where the file will be stored.
    destination(req, file, cb){
        cb(null, "profile_pictures")
    },
    //This decides how the file name will be saved
    filename(req, file, cb){
        cb(null, Date.now() + "_" + file.originalname);
    },
});
//must use in case of multiple file uploads ex:  uploadProfilePic.array("profilePic")
// const fileFilter = (req, file, cb) => {
//     if(file.mimetype?.startsWith("image/")){
//         cb(null, true);
//     }
//     else{
//         c(new Error("only images are allowed as profile"));
//     }
// }

//You are creating a middleware function using Multer
const uploadProfilePic = multer({storage});
export default uploadProfilePic;