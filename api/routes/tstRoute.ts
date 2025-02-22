import * as express from 'express';
import tstController from 'api/controller/tstController';
import { verifyToken } from '../middlewares/authJwt';

const tstRouter = express.Router();

tstRouter.get('/get_tst', verifyToken, tstController.snd);
tstRouter.get('/get_all', verifyToken, tstController.get_all);
tstRouter.post('/add_tst', verifyToken, tstController.add_tst);
tstRouter.post('/csvtojson', verifyToken, tstController.csvtojson);

export default tstRouter;