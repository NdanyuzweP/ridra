import mongoose, { Schema } from 'mongoose';
import { IUserInterest } from '../types';

const userInterestSchema = new Schema<IUserInterest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    busScheduleId: {
      type: Schema.Types.ObjectId,
      ref: 'BusSchedule',
      required: true,
    },
    pickupPointId: {
      type: Schema.Types.ObjectId,
      ref: 'PickupPoint',
      required: true,
    },
    status: {
      type: String,
      enum: ['interested', 'confirmed', 'cancelled'],
      default: 'interested',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUserInterest>('UserInterest', userInterestSchema);