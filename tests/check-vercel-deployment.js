const https = require('https');

const VERCEL_URL = 'https://interactive-prompt-iterator-9ecljhh99.vercel.app/';
const CHECK_INTERVAL = 10000; // Check every 10 seconds.
const MAX_ATTEMPTS = 30; // Check up to 30 times (5 minutes).

let attempts = 0;

function checkDeployment() {
  attempts++;
  console.log(`\n[${new Date().toLocaleTimeString()}] Checking deployment status (${attempts}/${MAX_ATTEMPTS})...`);

  https.get(VERCEL_URL, (res) => {
    const { statusCode } = res;
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (statusCode === 200) {
        // Check whether this is an authentication page.
        if (data.includes('Authentication Required') || data.includes('Vercel Authentication')) {
          console.log('⚠️  Deployment succeeded, but authentication is required (Deployment Protection is enabled)');
          console.log('✅ Code was deployed to Vercel successfully');
          console.log('🔒 Disable Deployment Protection to make it publicly accessible');
          process.exit(0);
        } else if (data.includes('<!DOCTYPE html>') || data.includes('<html')) {
          console.log('✅ Deployment succeeded. The site is accessible');
          console.log(`🌐 URL: ${VERCEL_URL}`);
          process.exit(0);
        }
      } else if (statusCode === 404) {
        console.log('⚠️  Received 404 response; deployment may still be in progress...');
      } else {
        console.log(`⚠️  Received ${statusCode} response`);
      }

      if (attempts >= MAX_ATTEMPTS) {
        console.log('\n❌ Timed out after 5 minutes; deployment may have failed');
        console.log('Check the Vercel deployment logs manually');
        process.exit(1);
      }

      setTimeout(checkDeployment, CHECK_INTERVAL);
    });
  }).on('error', (err) => {
    console.error('❌ Request failed:', err.message);

    if (attempts >= MAX_ATTEMPTS) {
      process.exit(1);
    }

    setTimeout(checkDeployment, CHECK_INTERVAL);
  });
}

console.log('🚀 Monitoring Vercel deployment status...');
console.log(`📍 URL: ${VERCEL_URL}`);
console.log(`⏱️  Check interval: ${CHECK_INTERVAL / 1000} seconds`);
console.log(`🔄 Max attempts: ${MAX_ATTEMPTS}`);

checkDeployment();
