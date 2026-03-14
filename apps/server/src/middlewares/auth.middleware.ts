import { Request,Response,NextFunction } from "express";
import { asyncHandler } from "./asyncHandler";
import { verifyJwt } from "../utlis";
import { AppError } from "../errors/Apperror";

declare module "express-serve-static-core" {
    interface Request{
        userId?:string
    }
}
export const authenticateJwtFromCookies=(cookieName:string)=>{
    return asyncHandler(async (req:Request,res:Response,next:NextFunction)=>{
        const token  = req.cookies[cookieName]
        if (!token){
            throw new AppError("Not Authorized",401)
        }
      const {userId} =  verifyJwt(token)
      if(!userId){
        throw new AppError("User not found",400)
      }
      req.userId = userId
      next()
    })

}