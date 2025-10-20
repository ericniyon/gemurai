#!/usr/bin/env node

// Minimal script to generate a JWT with optional no-expiration
// Uses the same signing approach as lib/token.ts (HS256 via `jose`)

// Use jsonwebtoken for compatibility with current Node runtime

async function main() {
  try {
    const jwt = require('jsonwebtoken')
    const args = process.argv.slice(2)
    const argMap = {}
    for (let i = 0; i < args.length; i++) {
      const part = args[i]
      if (part.startsWith('--')) {
        const key = part.replace(/^--/, '')
        const next = args[i + 1]
        if (!next || next.startsWith('--')) {
          argMap[key] = true
        } else {
          argMap[key] = next
          i++
        }
      }
    }

    const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
    if (!JWT_SECRET || typeof JWT_SECRET !== 'string' || JWT_SECRET.length < 10) {
      console.error('JWT_SECRET (or NEXTAUTH_SECRET) must be set and at least 10 characters long')
      process.exit(1)
    }

    const role = (argMap.role || 'EMPLOYER').toString().toUpperCase()
    const id = (argMap.id || 'employer-noexp-token')
    const email = argMap.email || 'employer@example.com'
    const name = argMap.name || 'Employer No-Exp'
    const phone = argMap.phone || undefined
    const avatar = argMap.avatar || undefined
    const noExp = !!argMap['no-exp'] || !!argMap.noexp || !!argMap.noexpire

    const payload = {
      email,
      phone,
      role,
      name,
      avatar,
      hasPermissions: false,
    }

    const signOptions = {
      algorithm: 'HS256',
      subject: id,
      // jsonwebtoken will add iat automatically
    }

    if (!noExp) {
      signOptions.expiresIn = '7d'
    }

    const token = jwt.sign(payload, JWT_SECRET, signOptions)
    console.log(token)
  } catch (err) {
    console.error('Failed to create token:', err && err.message ? err.message : err)
    process.exit(1)
  }
}

main()


