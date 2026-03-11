import { Router } from 'express';
import { validateResidentId, validateTransactionBody } from '../middleware/validate';
import { getResident, getTransactions, addTransaction } from '../controllers/residentsController';

const router = Router();

router.get('/:id', validateResidentId, getResident);

router.get('/:id/transactions', validateResidentId, getTransactions);

router.post('/:id/transactions', validateResidentId, validateTransactionBody, addTransaction);

export default router;
