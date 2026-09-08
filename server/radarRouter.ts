import { Router } from 'express';

const router = Router();
router.get('/metrics', (req, res) => {
  res.json([0.8, 0.6, 0.9, 0.4, 0.7]);
});
export default router;