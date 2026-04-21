export const isMemberMiddleware = (req,res,next) => {
    try{
        if(req.user?.role !== "member")
            throw new Error("api can only be accessed by member");
        next();
    }
    catch(error){
        console.log(error);
        return res.json({
            error:{message: "unable to fetch memer dashoard",
            info:error.message,}, data:null,
        })
    }
}