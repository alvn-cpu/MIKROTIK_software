#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('=== Pre-build verification script ===');

// Check current working directory
console.log('Current working directory:', process.cwd());

// Check if frontend directory exists
const frontendDir = path.join(process.cwd(), 'frontend');
console.log('Frontend directory:', frontendDir);
console.log('Frontend directory exists:', fs.existsSync(frontendDir));

if (fs.existsSync(frontendDir)) {
  const frontendContents = fs.readdirSync(frontendDir);
  console.log('Frontend directory contents:', frontendContents);
  
  // Check if public directory exists
  const publicDir = path.join(frontendDir, 'public');
  console.log('Public directory:', publicDir);
  console.log('Public directory exists:', fs.existsSync(publicDir));
  
  if (fs.existsSync(publicDir)) {
    const publicContents = fs.readdirSync(publicDir);
    console.log('Public directory contents:', publicContents);
    
    // Check if index.html exists
    const indexPath = path.join(publicDir, 'index.html');
    console.log('Index.html path:', indexPath);
    console.log('Index.html exists:', fs.existsSync(indexPath));
    
    if (fs.existsSync(indexPath)) {
      const stats = fs.statSync(indexPath);
      console.log('Index.html size:', stats.size, 'bytes');
      console.log('✅ All files are present and correct!');
    } else {
      console.log('❌ index.html is missing!');
      
      // Try to create a basic index.html as fallback
      const basicHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="WiFi Billing System" />
    <title>WiFi Billing System</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`;
      
      fs.writeFileSync(indexPath, basicHtml);
      console.log('✅ Created basic index.html as fallback');
    }
  } else {
    console.log('❌ Public directory is missing!');
    // Create public directory and basic files
    fs.mkdirSync(publicDir, { recursive: true });
    
    const basicHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="WiFi Billing System" />
    <title>WiFi Billing System</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`;
    
    fs.writeFileSync(path.join(publicDir, 'index.html'), basicHtml);
    console.log('✅ Created public directory and index.html');
  }
} else {
  console.log('❌ Frontend directory is missing!');
  process.exit(1);
}

console.log('=== Pre-build verification complete ===');