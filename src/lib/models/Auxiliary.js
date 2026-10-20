import mongoose from 'mongoose';

const EmailEventSchema = new mongoose.Schema(
  {
    messageIdHash: { type: String, required: true, unique: true, index: true },
    from: { type: String, required: true },
    subject: { type: String, required: true },
    receivedAt: { type: Date, required: true },
    ruleId: { type: String },
    parseOk: { type: Boolean, default: false },
    parseReason: { type: String },
    amountPaisa: { type: Number },
    reference: { type: String },
    bankTxnId: { type: String },
    authResult: { type: String, enum: ['PASS', 'FAIL', 'UNKNOWN'], default: 'UNKNOWN' },
    status: {
      type: String,
      enum: ['MATCHED', 'UNMATCHED', 'IGNORED', 'REVIEW'],
      default: 'UNMATCHED',
      index: true,
    },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    textSnippet: { type: String, maxlength: 1000 },
    // TTL field: 10 min for UNMATCHED, updated to 24h when status -> MATCHED
    expireAt: { type: Date, default: () => new Date(Date.now() + 10 * 60 * 1000) },
  },
  { timestamps: true }
);

// TTL index — MongoDB monitors this and auto-deletes docs where expireAt <= now (async, ~60s delay)
EmailEventSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
// Sort index for the admin emails API (newest first)
EmailEventSchema.index({ receivedAt: -1 });

export const EmailEvent = mongoose.models.EmailEvent || mongoose.model('EmailEvent', EmailEventSchema);

const AuditLogSchema = new mongoose.Schema(
  {
    at: { type: Date, default: Date.now, index: true },
    actor: { type: String, enum: ['SYSTEM', 'ADMIN', 'BUYER'], required: true },
    action: { type: String, required: true },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    emailId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailEvent' },
    from: { type: String },
    to: { type: String },
    note: { type: String },
    ip: { type: String },
  },
  { timestamps: true }
);

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);

const SyncStateSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'gmail', unique: true },
    lockedUntil: { type: Date },
    lastRunAt: { type: Date },
    lastSuccessAt: { type: Date },
    lastError: { type: String },
    lastEmailAt: { type: Date },
    runsToday: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const SyncState = mongoose.models.SyncState || mongoose.model('SyncState', SyncStateSchema);
