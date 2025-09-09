// import { test, expect, Browser, Page } from '@playwright/test'
// import { chromium } from 'playwright-extra'
// import crypto from 'crypto'
// import dotenv from 'dotenv'
// // Load environment variables
// import stealth from 'puppeteer-extra-plugin-stealth'  // ✅ this is correct

// dotenv.config()
// const CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID as string
// const CLIENT_SECRET = process.env.SOUNDCLOUD_CLIENT_SECRET as string
// const REDIRECT_URI = 'http://localhost:3000/callback'
// const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// async function humanLikeInteraction(page: Page) {
//   // Random mouse movement and click
//   await page.mouse.move(
//     Math.floor(Math.random() * 400) + 100, // random between 100-500
//     Math.floor(Math.random() * 400) + 100
//   )
//   await page.mouse.down()
//   await page.mouse.up()
  
//   // Random scroll
//   await page.evaluate(() => {
//     window.scrollTo(0, Math.random() * document.body.scrollHeight)
//   })
  
//   // Random sleep between 1-3 seconds
//   const sleepTime = Math.random() * 2000 + 1000 // 1000-3000ms
//   await sleep(sleepTime)
// }
// // PKCE codes
// const generatePKCECodes = () => {
//   const codeVerifier = crypto.randomBytes(32).toString('base64url')
//   const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url')
//   return { codeVerifier, codeChallenge }
// }
// const generateState = () => crypto.randomBytes(16).toString('hex')

// test('SoundCloud Authorization Code Flow with Google', async () => {
  
//   chromium.use(stealth())
//   const browser: Browser = await chromium.launch({ headless: false, slowMo: 50 })
//   const page: Page = await browser.newPage()



//   try {
//     const { codeVerifier, codeChallenge } = generatePKCECodes()
//     const state = generateState()

//     await page.goto('http://localhost:3000')
//        await humanLikeInteraction(page)

//     await page.evaluate(({ codeVerifier, state }) => {
//       localStorage.setItem('code_verifier', codeVerifier)
//       localStorage.setItem('oauth_state', state)
//     }, { codeVerifier, state })

//     const authUrl = new URL('https://secure.soundcloud.com/authorize')
//     authUrl.searchParams.append('client_id', CLIENT_ID)
//     authUrl.searchParams.append('redirect_uri', REDIRECT_URI)
//     authUrl.searchParams.append('response_type', 'code')
//     authUrl.searchParams.append('code_challenge', codeChallenge)
//     authUrl.searchParams.append('code_challenge_method', 'S256')
//     authUrl.searchParams.append('state', state)

//     await page.goto(authUrl.toString())
//     console.log('🔗 Visiting:', authUrl.toString())

//         await humanLikeInteraction(page)

//     // Try Google login first
//     try {
//       const googleButton = page.locator('button.sc-button-google')
//       await googleButton.waitFor({ timeout: 15000 })
//       console.log('🌐 Found Continue with Google — clicking...')
//       const [googlePopup] = await Promise.all([
//         page.waitForEvent('popup'),
//         googleButton.click(),
//       ])

//       await googlePopup.waitForLoadState('domcontentloaded')
//       await humanLikeInteraction(googlePopup)

//       const googleEmail = process.env.GOOGLE_EMAIL
//       const googlePassword = process.env.GOOGLE_PASSWORD
//       if (!googleEmail || !googlePassword) throw new Error('❌ GOOGLE_EMAIL and GOOGLE_PASSWORD must be set')

//       // Fill email
//       await googlePopup.fill('input[type="email"], #identifierId', googleEmail)
//             await sleep(Math.random() * 1000 + 500) // Random delay

//       await googlePopup.click('#identifierNext, button:has-text("Next")')

//       await sleep(Math.random() * 2000 + 1000)
//       await humanLikeInteraction(googlePopup)
//       // Wait for password page to load
//       // Try both name=Passwd and fallback :visible selector
//       let passwordField = googlePopup.locator('input[name="Passwd"]:visible')
//       if (!(await passwordField.count())) {
//         passwordField = googlePopup.locator('input[type="password"]:visible')
//       }

//       await passwordField.fill(googlePassword)
//       await sleep(Math.random() * 1000 + 500) // Random delay

//       // Click Next after entering password
//       const nextButton = googlePopup.getByRole('button', { name: 'Next' })
//       await nextButton.click()

//       // Wait until popup closes (OAuth redirect complete)
//       while (!googlePopup.isClosed()) {
//         await new Promise(resolve => setTimeout(resolve, 100))
//       }
//       console.log('✅ Google OAuth login completed')
//     } catch(e) {
      
//     console.log(e)
//     }
//     await humanLikeInteraction(page)

//     // Handle "Connect" page if it appears
//     try {
//       const connectButton = page.locator('button:has-text("Connect"), button:has-text("Connect and continue")')
//       await connectButton.waitFor({ timeout: 10000 })
//       console.log('🔗 Clicking Connect / Continue button...')
//       await connectButton.click()
//     } catch {
//       console.log('ℹ️ No Connect button, skipping...')
//     }

//     // Wait for callback redirect
//     await page.waitForURL(/localhost:3000\/callback/, { timeout: 30000 })
//     const callbackUrl = page.url()
//     const url = new URL(callbackUrl)
//     const authorizationCode = url.searchParams.get('code')
//     const returnedState = url.searchParams.get('state')

//     expect(returnedState).toBe(state)
//     expect(authorizationCode).toBeTruthy()

//     // Exchange code for token
//     const tokenResponse = await fetch('https://secure.soundcloud.com/oauth/token', {
//       method: 'POST',
//       headers: {
//         'accept': 'application/json; charset=utf-8',
//         'Content-Type': 'application/x-www-form-urlencoded'
//       },
//       body: new URLSearchParams({
//         'grant_type': 'authorization_code',
//         'client_id': CLIENT_ID,
//         'client_secret': CLIENT_SECRET,
//         'redirect_uri': REDIRECT_URI,
//         'code_verifier': codeVerifier,
//         'code': authorizationCode!
//       })
//     })

//     expect(tokenResponse.ok).toBeTruthy()
//     const tokenData = await tokenResponse.json()
//     expect(tokenData.access_token).toBeTruthy()

//     console.log('✅ Flow completed. Access Token:', tokenData.access_token)

//   } catch (err) {
//     console.error('❌ Test failed:', err)
//   } finally {
//     console.log('🚪 Closing browser...')
//     await browser.close()
//   }
// })
import { test, expect, Browser, Page } from '@playwright/test'
import { chromium } from 'playwright-extra'
import crypto from 'crypto'
import dotenv from 'dotenv'
import stealth from 'puppeteer-extra-plugin-stealth'

dotenv.config()
const CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID as string
const CLIENT_SECRET = process.env.SOUNDCLOUD_CLIENT_SECRET as string
const REDIRECT_URI = 'http://localhost:3000/callback'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// User agent pool
const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1.2 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0 Safari/537.36"
];

// Fingerprint randomization function
async function randomizeFingerprint(page: Page) {
  // Random user agent
  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  await page.setExtraHTTPHeaders({
    'User-Agent': randomUserAgent
  });

  // Random viewport size
  const viewportWidth = Math.floor(Math.random() * (1920 - 1024 + 1)) + 1024; // 1024-1920
  const viewportHeight = Math.floor(Math.random() * (1080 - 768 + 1)) + 768; // 768-1080
  
  await page.setViewportSize({
    width: viewportWidth,
    height: viewportHeight
  });

  // Randomize browser fingerprint properties
  await page.addInitScript(() => {
    // Hardware concurrency
    const hardwareConcurrency = Math.floor(Math.random() * 15) + 2; // 2-16
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      get: () => hardwareConcurrency
    });

    // Device memory (if supported)
    if ('deviceMemory' in navigator) {
      const deviceMemory = [2, 4, 8, 16][Math.floor(Math.random() * 4)];
      Object.defineProperty(navigator, 'deviceMemory', {
        get: () => deviceMemory
      });
    }

    // Language randomization
    const languages = [
      ['en-US', 'en'],
      ['en-GB', 'en'],
      ['fr-FR', 'fr'],
      ['de-DE', 'de'],
      ['es-ES', 'es']
    ];
    const randomLang = languages[Math.floor(Math.random() * languages.length)];
    
    Object.defineProperty(navigator, 'languages', {
      get: () => randomLang
    });
    
    Object.defineProperty(navigator, 'language', {
      get: () => randomLang[0]
    });

    // Screen properties
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const availWidth = screenWidth - Math.floor(Math.random() * 100);
    const availHeight = screenHeight - Math.floor(Math.random() * 100);

    Object.defineProperty(screen, 'availWidth', {
      get: () => availWidth
    });
    
    Object.defineProperty(screen, 'availHeight', {
      get: () => availHeight
    });

    // Timezone randomization
    const timezones = [
      'America/New_York',
      'America/Los_Angeles', 
      'Europe/London',
      'Europe/Paris',
      'Asia/Tokyo'
    ];
    const randomTimezone = timezones[Math.floor(Math.random() * timezones.length)];
    
    // Override timezone
    const originalDateTimeFormat = Intl.DateTimeFormat;
    Intl.DateTimeFormat = new Proxy(originalDateTimeFormat, {
      construct(target, args) {
        if (args.length === 0) {
          args = [{ timeZone: randomTimezone }];
        } else if (typeof args[0] === 'object' && args[0] !== null) {
          args[0] = { ...args[0], timeZone: randomTimezone };
        }
        return new target(...args);
      }
    });

    // WebGL fingerprint randomization
    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
      if (parameter === 37445) { // UNMASKED_VENDOR_WEBGL
        return 'Intel Inc.';
      }
      if (parameter === 37446) { // UNMASKED_RENDERER_WEBGL
        const renderers = [
          'Intel Iris OpenGL Engine',
          'Intel HD Graphics 630',
          'NVIDIA GeForce GTX 1060',
          'AMD Radeon Pro 580'
        ];
        return renderers[Math.floor(Math.random() * renderers.length)];
      }
      return getParameter.call(this, parameter);
    };
  });

  console.log(`🎭 Fingerprint randomized - UA: ${randomUserAgent.slice(0, 50)}..., Viewport: ${viewportWidth}x${viewportHeight}`);
}

async function humanLikeInteraction(page: Page) {
  // Random mouse movement and click
  await page.mouse.move(
    Math.floor(Math.random() * 400) + 100,
    Math.floor(Math.random() * 400) + 100
  )
  await page.mouse.down()
  await page.mouse.up()
  
  // Random scroll
  await page.evaluate(() => {
    window.scrollTo(0, Math.random() * document.body.scrollHeight)
  })
  
  // Random sleep between 1-3 seconds
  const sleepTime = Math.random() * 2000 + 1000
  await sleep(sleepTime)
}

// PKCE codes
const generatePKCECodes = () => {
  const codeVerifier = crypto.randomBytes(32).toString('base64url')
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url')
  return { codeVerifier, codeChallenge }
}
const generateState = () => crypto.randomBytes(16).toString('hex')

test('SoundCloud Authorization Code Flow with Google', async () => {
  chromium.use(stealth())
  const browser: Browser = await chromium.launch({ headless: false, slowMo: 50 })
  const page: Page = await browser.newPage()

  // Apply fingerprint randomization BEFORE any navigation
  await randomizeFingerprint(page)

  try {
    const { codeVerifier, codeChallenge } = generatePKCECodes()
    const state = generateState()

    await page.goto('http://localhost:3000')
    await humanLikeInteraction(page)

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

    await humanLikeInteraction(page)

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
      
      // Apply fingerprint randomization to popup as well
      await randomizeFingerprint(googlePopup)
      await humanLikeInteraction(googlePopup)

      const googleEmail = process.env.GOOGLE_EMAIL
      const googlePassword = process.env.GOOGLE_PASSWORD
      if (!googleEmail || !googlePassword) throw new Error('❌ GOOGLE_EMAIL and GOOGLE_PASSWORD must be set')

      // Fill email
      await googlePopup.fill('input[type="email"], #identifierId', googleEmail)
      await sleep(Math.random() * 1000 + 500)

      await googlePopup.click('#identifierNext, button:has-text("Next")')

      await sleep(Math.random() * 2000 + 1000)
      await humanLikeInteraction(googlePopup)

      // Try both name=Passwd and fallback :visible selector
      let passwordField = googlePopup.locator('input[name="Passwd"]:visible')
      if (!(await passwordField.count())) {
        passwordField = googlePopup.locator('input[type="password"]:visible')
      }

      await passwordField.fill(googlePassword)
      await sleep(Math.random() * 1000 + 500)

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

    await humanLikeInteraction(page)

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