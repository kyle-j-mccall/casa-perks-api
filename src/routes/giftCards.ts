import { Router } from 'express';
import { getGiftCards, getGiftCardById } from '../controllers/giftCardsController';

const router = Router();

router.get('/', getGiftCards);
router.get('/:id', getGiftCardById);

export default router;
