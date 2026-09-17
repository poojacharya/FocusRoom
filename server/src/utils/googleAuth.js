import { OAuth2Client } from 'google-auth-library'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export function normalizeGooglePayload(payload) {
  if (!payload || !payload.email) {
    throw new Error('Google payload is missing an email')
  }

  if (payload.email_verified !== true) {
    throw new Error('Google email must be verified before sign-in can continue')
  }

  const email = payload.email.toLowerCase()

  return {
    email,
    name: payload.name || payload.given_name || email.split('@')[0],
    googleId: payload.sub,
    avatar: payload.picture || undefined,
  }
}

export async function verifyGoogleIdToken(credential) {
  if (!credential || typeof credential !== 'string' || credential.trim().length === 0) {
    throw new Error('Google credential is required')
  }

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  })

  const payload = ticket.getPayload()
  if (!payload) {
    throw new Error('Google token verification failed')
  }

  return normalizeGooglePayload(payload)
}
