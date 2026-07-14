import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12

/**
 * We never store raw refresh tokens — only a SHA-256 hash of each one
 * (see utils/jwt.js#hashToken). Unlike bcrypt, SHA-256 is deterministic,
 * which is what lets us look a presented token up against this array in
 * the first place. Bcrypt stays reserved for the password field below,
 * where slow-by-design hashing is actually the point.
 *
 * Reads/writes against this array go through atomic MongoDB operators
 * ($push / $pull in auth.controller.js's issueTokenPair/refresh/logout)
 * rather than instance methods that mutate an in-memory copy and re-save
 * the whole document. The earlier instance-method version
 * (addRefreshToken/removeRefreshToken/pruneExpiredRefreshTokens) caused a
 * read-modify-write race under concurrent refresh calls — see the fix
 * notes at the top of issueTokenPair() in auth.controller.js — so those
 * methods have been removed rather than left around to be reused.
 */
const refreshTokenSchema = new mongoose.Schema(
  {
    hashedToken: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { _id: false, timestamps: { createdAt: true, updatedAt: false } },
)

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: 60,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    // Rotating refresh-token hashes. select:false keeps them out of normal
    // queries; controllers that need to read them opt in with
    // .select('+refreshTokens'). Mutations go through atomic $push/$pull
    // against the collection, not through this loaded copy.
    refreshTokens: {
      type: [refreshTokenSchema],
      default: [],
      select: false,
    },
  },
  { timestamps: true },
)

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS)
  next()
})

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Belt-and-braces: even if a controller forgets to select password/refreshTokens
// out before sending a user object back, they never survive serialization.
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password
    delete ret.refreshTokens
    delete ret.__v
    return ret
  },
})

export const User = mongoose.model('User', userSchema)
