import { Request, Response, NextFunction } from 'express';
const jwt = require("jsonwebtoken");
import User from '../models/user';
import Role from '../models/role';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers["x-access-token"];
    if (!token) {
        return res.status(403).send({ message: "No token provided!" });
    }

   return jwt.verify(token, 'your_jwt_secret', (err: any, decoded: any) => {
        if (err) {
            return res.status(401).send({ message: "Unauthorized!" });
        }
        req.headers['userId'] = decoded.id;
        return next();
    });
};
