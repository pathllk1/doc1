import { Router } from 'express';
import AuthController from '../controller/auth.controller';

const router = Router();

// Define routes for login and register
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

export const authRoute = router;
