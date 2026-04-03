import { getPayload } from 'payload'
import config from '../payload.config.ts'

const email = process.env.E2E_ADMIN_EMAIL || 'e2e-test@jurislm.com'
const password = process.env.E2E_ADMIN_PASSWORD || 'E2ETest2026'

async function main() {
  const payload = await getPayload({ config })

  try {
    const user = await payload.create({
      collection: 'users',
      data: { email, password },
    })
    console.log('Created user:', user.id, user.email)
    process.exit(0)
  } catch (e: unknown) {
    const err = e as Error
    console.error('Error creating test user:', err.message)
    process.exit(1)
  }
}

main()
