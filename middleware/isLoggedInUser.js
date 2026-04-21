import jwt from "jsonwebtoken";
const isLoggedIn = (req, res, next) => {
    const token = req.cookies.token;

    if(!token){
        return res.json({data: {message: "Not logged in"},error: null});
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
};

export default isLoggedIn;