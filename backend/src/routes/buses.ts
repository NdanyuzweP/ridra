import express from 'express';
import {
  createBus,
  getAllBuses,
  getBusById,
  getDriverBus,
  updateBus,
  deleteBus,
} from '../controllers/busController';
import { authenticate, authorize } from '../middleware/auth';
import { validateBus } from '../middleware/validation';

const router = express.Router();

/**
 * @swagger
 * /api/buses:
 *   post:
 *     summary: Create a new bus
 *     tags: [Buses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plateNumber:
 *                 type: string
 *               capacity:
 *                 type: number
 *               driverId:
 *                 type: string
 *               routeId:
 *                 type: string
 *               fare:
 *                 type: number
 *     responses:
 *       201:
 *         description: Bus created successfully
 */
router.post('/', authenticate, authorize('admin'), validateBus, createBus);

/**
 * @swagger
 * /api/buses:
 *   get:
 *     summary: Get all buses
 *     tags: [Buses]
 *     responses:
 *       200:
 *         description: List of all buses
 */
router.get('/', getAllBuses);

/**
 * @swagger
 * /api/buses/driver/my-bus:
 *   get:
 *     summary: Get driver's assigned bus
 *     tags: [Buses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Driver's bus details
 *       404:
 *         description: No bus assigned
 */
router.get('/driver/my-bus', authenticate, authorize('driver'), getDriverBus);

/**
 * @swagger
 * /api/buses/{id}:
 *   get:
 *     summary: Get bus by ID
 *     tags: [Buses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bus details
 *       404:
 *         description: Bus not found
 */
router.get('/:id', getBusById);

router.put('/:id', authenticate, authorize('admin'), updateBus);
router.delete('/:id', authenticate, authorize('admin'), deleteBus);

export default router;