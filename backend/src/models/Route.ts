import mongoose, { Schema } from 'mongoose';
import { IRoute } from '../types';

const routeSchema = new Schema<IRoute>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    pickupPoints: [
      {
        type: Schema.Types.ObjectId,
        ref: 'PickupPoint',
      },
    ],
    estimatedDuration: {
      type: Number,
      required: true,
      min: 1,
    },
    fare: {
      type: Number,
      required: true,
      min: 0,
      default: 400, // Default fare in RWF
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IRoute>('Route', routeSchema);