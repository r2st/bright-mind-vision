#!/usr/bin/env node

// Setup script for Groq RAG environment
import fs from 'fs';
import path from 'path';

const envContent = `# Groq API Configuration
LLM_GROQ_API_KEY=your_groq_api_key_here

# Model Selection Strategy
GROQ_PRIMARY_MODEL=llama-3.1-8b-instant
GROQ_VERSATILE_MODEL=llama-3.3-70b-versatile
GROQ_GUARD_MODEL=meta-llama/llama-guard-4-12b

# RAG Configuration
RAG_BM25_WEIGHT=0.4
RAG_VECTOR_WEIGHT=0.4
RAG_BUSINESS_WEIGHT=0.2
RAG_MAX_CANDIDATES=20
RAG_FINAL_RECOMMENDATIONS=5

# Safety Configuration
ENABLE_SAFETY_GUARD=true
SAFETY_THRESHOLD=0.7
`;

const envPath = path.join(process.cwd(), '.env.local');

console.log('🔧 Setting up Groq RAG environment...');

// Check if .env.local exists
if (fs.existsSync(envPath)) {
  console.log('📄 .env.local already exists. Appending Groq configuration...');
  
  const existingContent = fs.readFileSync(envPath, 'utf8');
  
  // Check if Groq config already exists
  if (existingContent.includes('LLM_GROQ_API_KEY')) {
    console.log('✅ Groq configuration already exists in .env.local');
  } else {
    // Append Groq config
    fs.appendFileSync(envPath, '\n' + envContent);
    console.log('✅ Added Groq configuration to .env.local');
  }
} else {
  // Create new .env.local file
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local with Groq configuration');
}

console.log('\n📋 Next steps:');
console.log('1. Get your Groq API key from: https://console.groq.com/keys');
console.log('2. Update LLM_GROQ_API_KEY in .env.local');
console.log('3. Run: node test-rag-system.js');
console.log('4. Test the RAG API: curl -X POST http://localhost:3000/api/meshai/ai-recommendation-rag');

console.log('\n🔑 To get your Groq API key:');
console.log('1. Visit: https://console.groq.com/keys');
console.log('2. Sign up or log in');
console.log('3. Create a new API key');
console.log('4. Copy the key and update .env.local');

console.log('\n📚 Available models:');
console.log('- llama-3.1-8b-instant (fast, good for simple queries)');
console.log('- llama-3.3-70b-versatile (slower, better for complex queries)');
console.log('- meta-llama/llama-guard-4-12b (safety guard)');

console.log('\n🎯 Test queries to try:');
console.log('- "I need help with relaxation and stress relief"');
console.log('- "Looking for luxury skincare products"');
console.log('- "I want a luxury handbag for special occasion"');
console.log('- "Need organic products for wellness"');
console.log('- "Looking for luxury watches with investment value"');
