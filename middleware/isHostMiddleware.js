export const isHostMiddleWare = (req,res,next) => {
    try{
        if(req.user.role !== "host")
            throw new Error("logged in user is not a host");
        next();
    }
    catch(err){
        return res.json({
            error:{message: "failed to access host apis",
            info:err.message,}, data:null,
        })
    }
}