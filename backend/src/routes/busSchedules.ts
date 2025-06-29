import express from 'express';
import {
  createBusSchedule,
  getAllBusSchedules,
  getBusScheduleById,
  updateBusSchedule,
  updateArrivalTime,
  getInterestedUsers,
  deleteBusSchedule,
} from '../controllers/busScheduleController';
import { authenticate, authorize } from '../middleware/auth';
import { validateBusSchedule } from '../middleware/validation';

const router = express.Router();

/**
 * @swagger
 * /api/bus-schedules:
 *   post:
 *     summary: Create a new bus schedule
 *     tags: [Bus Schedules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               busId:
 *                 type: string
 *               routeId:
 *                 type: string
 *               departureTime:
 *                 type: string
 *                 format: date-time
 *               estimatedArrivalTimes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     pickupPointId:
 *                       type: string
 *                     estimatedTime:
 *                       type: string
 *                       format: date-time
 *     responses:
 *       201:
 *         description: Bus schedule created successfully
 */
router.post('/', authenticate, authorize('admin', 'driver'), validateBusSchedule, createBusSchedule);

/**
 * @swagger
 * /api/bus-schedules:
 *   get:
 *     summary: Get all bus schedules
 *     tags: [Bus Schedules]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, in-transit, completed, cancelled]
 *       - in: query
 *         name: routeId
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of bus schedules
 */
router.get('/', getAllBusSchedules);

router.get('/:id', getBusScheduleById);
router.put('/:id', authenticate, authorize('admin', 'driver'), updateBusSchedule);

/**
 * @swagger
 * /api/bus-schedules/{id}/arrival:
 *   patch:
 *     summary: Update actual arrival time for a pickup point
 *     tags: [Bus Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pickupPointId:
 *                 type: string
 *               actualTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Arrival time updated successfully
 */
router.patch('/:id/arrival', authenticate, authorize('driver'), updateArrivalTime);

/**
 * @swagger
 * /api/bus-schedules/{id}/interested-users:
 *   get:
 *     summary: Get interested users for a bus schedule
 *     tags: [Bus Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of interested users
 */
router.get('/:id/interested-users', authenticate, authorize('driver', 'admin'), getInterestedUsers);

router.delete('/:id', authenticate, authorize('admin'), deleteBusSchedule);

export default router;