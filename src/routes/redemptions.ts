import { Router } from 'express';
import { validateResidentId, validateRedemptionBody } from '../middleware/validate';
import { redemptionLimiter } from '../middleware/rateLimiter';
import { redeemGiftCard } from '../controllers/redemptionsController';

const router = Router();

router.post('/:id/redeem', redemptionLimiter, validateResidentId, validateRedemptionBody, redeemGiftCard);

export default router;
