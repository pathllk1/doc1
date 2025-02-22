import * as express from 'express';
import docsController from '../controller/docs.controller';
import { verifyToken } from '../middlewares/authJwt'; 

const docsRouter = express.Router();

// Define routes and associate them with controller methods

docsRouter.get('/get_docs', verifyToken, docsController.getDocs);
docsRouter.post('/add_doc', verifyToken, docsController.addDoc);
docsRouter.post('/add_edit', verifyToken, docsController.findByIdAndUpdateOrInsert);
docsRouter.put('/update_doc/:id', verifyToken, docsController.updateDoc);
docsRouter.delete('/delete_doc/:id', verifyToken, docsController.deleteDoc);
docsRouter.get('/send_email', verifyToken, docsController.snd);

export default docsRouter;
