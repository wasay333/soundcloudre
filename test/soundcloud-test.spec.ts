import { test, expect, Browser, Page } from '@playwright/test'
import { chromium } from 'playwright'
import crypto from 'crypto'
import dotenv from 'dotenv'
// Load environment variables
dotenv.config()
const CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID as string
const CLIENT_SECRET = process.env.SOUNDCLOUD_CLIENT_SECRET as string
const REDIRECT_URI = 'http://localhost:3000/callback'

// PKCE codes
const generatePKCECodes = () => {
  const codeVerifier = crypto.randomBytes(32).toString('base64url')
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url')
  return { codeVerifier, codeChallenge }
}
const generateState = () => crypto.randomBytes(16).toString('hex')

test('SoundCloud Authorization Code Flow with Google', async () => {
  const browser: Browser = await chromium.launch({ headless: false, slowMo: 50 })
  const page: Page = await browser.newPage()
// Import stealth plugin or define stealth_sync function

// Apply stealth plugin to the browser


  try {
    const { codeVerifier, codeChallenge } = generatePKCECodes()
    const state = generateState()

    await page.goto('http://localhost:3000')
    await page.evaluate(({ codeVerifier, state }) => {
      localStorage.setItem('code_verifier', codeVerifier)
      localStorage.setItem('oauth_state', state)
    }, { codeVerifier, state })

    const authUrl = new URL('https://secure.soundcloud.com/authorize')
    authUrl.searchParams.append('client_id', CLIENT_ID)
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI)
    authUrl.searchParams.append('response_type', 'code')
    authUrl.searchParams.append('code_challenge', codeChallenge)
    authUrl.searchParams.append('code_challenge_method', 'S256')
    authUrl.searchParams.append('state', state)

    await page.goto(authUrl.toString())
    console.log('🔗 Visiting:', authUrl.toString())

    // Try Google login first
    try {
      const googleButton = page.locator('button.sc-button-google')
      await googleButton.waitFor({ timeout: 15000 })
      console.log('🌐 Found Continue with Google — clicking...')
      const [googlePopup] = await Promise.all([
        page.waitForEvent('popup'),
        googleButton.click(),
      ])

      await googlePopup.waitForLoadState('domcontentloaded')

      const googleEmail = process.env.GOOGLE_EMAIL
      const googlePassword = process.env.GOOGLE_PASSWORD
      if (!googleEmail || !googlePassword) throw new Error('❌ GOOGLE_EMAIL and GOOGLE_PASSWORD must be set')

      // Fill email
      await googlePopup.fill('input[type="email"], #identifierId', googleEmail)
      await googlePopup.click('#identifierNext, button:has-text("Next")')

      // Wait for password page to load

      // Try both name=Passwd and fallback :visible selector
      let passwordField = googlePopup.locator('input[name="Passwd"]:visible')
      if (!(await passwordField.count())) {
        passwordField = googlePopup.locator('input[type="password"]:visible')
      }

      await passwordField.fill(googlePassword)

      // Click Next after entering password
      const nextButton = googlePopup.getByRole('button', { name: 'Next' })
      await nextButton.click()

      // Wait until popup closes (OAuth redirect complete)
      while (!googlePopup.isClosed()) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      console.log('✅ Google OAuth login completed')
    } catch(e) {
      
    console.log(e)
    }

    // Handle "Connect" page if it appears
    try {
      const connectButton = page.locator('button:has-text("Connect"), button:has-text("Connect and continue")')
      await connectButton.waitFor({ timeout: 10000 })
      console.log('🔗 Clicking Connect / Continue button...')
      await connectButton.click()
    } catch {
      console.log('ℹ️ No Connect button, skipping...')
    }

    // Wait for callback redirect
    await page.waitForURL(/localhost:3000\/callback/, { timeout: 30000 })
    const callbackUrl = page.url()
    const url = new URL(callbackUrl)
    const authorizationCode = url.searchParams.get('code')
    const returnedState = url.searchParams.get('state')

    expect(returnedState).toBe(state)
    expect(authorizationCode).toBeTruthy()

    // Exchange code for token
    const tokenResponse = await fetch('https://secure.soundcloud.com/oauth/token', {
      method: 'POST',
      headers: {
        'accept': 'application/json; charset=utf-8',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'grant_type': 'authorization_code',
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'redirect_uri': REDIRECT_URI,
        'code_verifier': codeVerifier,
        'code': authorizationCode!
      })
    })

    expect(tokenResponse.ok).toBeTruthy()
    const tokenData = await tokenResponse.json()
    expect(tokenData.access_token).toBeTruthy()

    console.log('✅ Flow completed. Access Token:', tokenData.access_token)

  } catch (err) {
    console.error('❌ Test failed:', err)
  } finally {
    console.log('🚪 Closing browser...')
    await browser.close()
  }
})
