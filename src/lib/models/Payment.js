import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema(
  {
    publicId: { type: String, required: true, unique: true, index: true },
    reference: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, maxlength: 80 },
    customerNote: { type: String, maxlength: 200 },
    orderRef: { type: String, maxlength: 64 },
    baseAmountPaisa: { type: Number, required: true },
    offsetPaisa: { type: Number, default: 0 },
    payableAmountPaisa: { type: Number },
    status: {
      type: String,
      enum: ['CREATED', 'PENDING', 'PAID', 'EXPIRED', 'CANCELLED', 'MANUAL_REVIEW'],
      default: 'CREATED',
      index: true,
    },
    startedAt: { type: Date },
    expiresAt: { type: Date },
    paidAt: { type: Date },
    returnUrl: { type: String },
    qrPayload: { type: String },
    matchedEmailId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailEvent' },
    paidVia: { type: String, enum: ['AUTO_EMAIL', 'MANUAL_ADMIN'] },
    manualNote: { type: String },
  },
  { timestamps: true }
);

PaymentSchema.index({ status: 1, payableAmountPaisa: 1 });
PaymentSchema.index({ status: 1, paidAt: 1 }); // stats: PAID payments within a date range
PaymentSchema.index(
  { baseAmountPaisa: 1, offsetPaisa: 1 },
  { unique: true, partialFilterExpression: { status: 'PENDING' } }
);

export const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
