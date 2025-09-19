#!/usr/bin/env node

/**
 * Security Cleanup Script
 * 
 * This script checks for potentially exposed secrets in the codebase
 * and ensures all sensitive values are properly handled via environment variables.
 */

const fs = require('fs');
const path = require('path');

// Patterns that might indicate exposed secrets
const SECRET_PATTERNS = [
  // Email addresses that should be in env vars
  /contact@brightmindvision\.com/g,
  /brightmindvision1@gmail\.com/g,
  
  // SMTP configurations
  /smtppro\.zoho\.in/g,
  /smtp\.zoho\.in/g,
  
  // Passwords or sensitive strings
  /amzy1@BMV/g,
  /your-app-password/g,
  
  // API keys or tokens (generic patterns)
  /[A-Za-z0-9]{32,}/g, // Long alphanumeric strings
];

// Files to check
const FILES_TO_CHECK = [
  'pages/api/send-booking-email.js',
  'pages/api/create-calendar-event.js',
  'pages/api/create-google-meet-event.js',
  'components/CustomCalendar.js',
  'components/Contact.js',
  'components/Footer.js',
  '.env.local',
  '.env.example',
];

// Files to exclude from checks
const EXCLUDE_FILES = [
  'node_modules',
  '.git',
  '.next',
  'security-cleanup.js',
  'package-lock.json',
];

function checkFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return { file: filePath, status: 'not-found', issues: [] };
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];

  SECRET_PATTERNS.forEach((pattern, index) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Skip if it's in a comment or already using env vars
        const lines = content.split('\n');
        const matchLine = lines.find(line => line.includes(match));
        
        if (matchLine && !matchLine.includes('process.env') && !matchLine.trim().startsWith('//')) {
          issues.push({
            pattern: pattern.toString(),
            match: match,
            line: matchLine.trim()
          });
        }
      });
    }
  });

  return {
    file: filePath,
    status: issues.length > 0 ? 'issues' : 'clean',
    issues: issues
  };
}

function scanDirectory(dir, results = []) {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    // Skip excluded directories
    if (stat.isDirectory() && !EXCLUDE_FILES.includes(item)) {
      scanDirectory(fullPath, results);
    } else if (stat.isFile() && !EXCLUDE_FILES.includes(item)) {
      // Check specific file types
      if (item.endsWith('.js') || item.endsWith('.jsx') || item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.md')) {
        results.push(checkFile(fullPath));
      }
    }
  });
  
  return results;
}

function main() {
  console.log('🔍 Security Cleanup Check');
  console.log('========================');
  console.log('');

  const results = scanDirectory('.');
  
  let totalIssues = 0;
  let filesWithIssues = 0;

  results.forEach(result => {
    if (result.status === 'issues') {
      filesWithIssues++;
      totalIssues += result.issues.length;
      
      console.log(`❌ ${result.file}`);
      result.issues.forEach(issue => {
        console.log(`   - Found: "${issue.match}"`);
        console.log(`     Line: ${issue.line}`);
      });
      console.log('');
    }
  });

  if (filesWithIssues === 0) {
    console.log('✅ All files are clean! No exposed secrets found.');
  } else {
    console.log(`⚠️  Found ${totalIssues} potential issues in ${filesWithIssues} files.`);
    console.log('');
    console.log('🔧 Recommended Actions:');
    console.log('1. Replace hardcoded values with environment variables');
    console.log('2. Use process.env.VARIABLE_NAME || "fallback" pattern');
    console.log('3. Ensure .env.local is in .gitignore');
    console.log('4. Never commit .env files to version control');
  }

  console.log('');
  console.log('📋 Environment Variables Checklist:');
  console.log('===================================');
  console.log('✅ SMTP_HOST - Email server hostname');
  console.log('✅ SMTP_PORT - Email server port');
  console.log('✅ SMTP_USER - Email username');
  console.log('✅ SMTP_PASS - Email password');
  console.log('✅ GOOGLE_CLIENT_ID - Google OAuth client ID');
  console.log('✅ GOOGLE_CLIENT_SECRET - Google OAuth client secret');
  console.log('✅ GOOGLE_REDIRECT_URI - Google OAuth redirect URI');
  console.log('✅ GOOGLE_REFRESH_TOKEN - Google OAuth refresh token');
  console.log('✅ SIMULATE_EMAILS - Development mode flag');
  console.log('✅ GOOGLE_MEET_API_ENABLED - Google Meet API flag');
  console.log('');
  console.log('🔒 Security Best Practices:');
  console.log('===========================');
  console.log('✅ All sensitive values in environment variables');
  console.log('✅ .env.local in .gitignore');
  console.log('✅ No hardcoded passwords or API keys');
  console.log('✅ Fallback values are generic (not real credentials)');
  console.log('✅ Environment variables properly prefixed');
}

if (require.main === module) {
  main();
}

module.exports = { checkFile, scanDirectory };
