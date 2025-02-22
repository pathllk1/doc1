import { Router } from 'express';
import NSEController from '../controller/nse.controller';
import { verifyToken } from 'api/middlewares/authJwt';

const nseRouter = Router();

// Define your routes here
nseRouter.get('/get_nse', NSEController.getAll_nse);

// Route to get all folio records
nseRouter.get('/folio', NSEController.getAllFolioRecords);
nseRouter.get('/cn_note', NSEController.getAllCNNotes);
nseRouter.get('/gs_record', NSEController.gs_record);
nseRouter.post('/upsert_folio', NSEController.upsertFolio);
nseRouter.post('/addnse_data', verifyToken, NSEController.addnse_data);
nseRouter.post('/updnse_data', verifyToken,  NSEController.updnse_data);

export default nseRouter;