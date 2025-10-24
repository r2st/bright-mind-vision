// Test cases for WhatsApp message processing
// Simulates various customer messages and tests AI recommendations

export default async function handler(req, res) {
  console.log('🔍 API Handler called with method:', req.method);
  console.log('🔍 Request body:', JSON.stringify(req.body, null, 2));
  
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { testType, customMessage } = req.body;
    console.log('🔍 Parsed request:', { testType, customMessage });

    let testResults = [];

    if (testType === 'all') {
      console.log('🔍 Running all test cases');
      // Run all test cases
      testResults = await runAllTestCases();
    } else if (testType === 'custom' && customMessage) {
      console.log('🔍 Testing custom message:', customMessage);
      // Test custom message
      testResults = await testCustomMessage(customMessage);
    } else if (testType === 'specific') {
      console.log('🔍 Running specific scenario');
      // Test specific scenarios
      const { scenario } = req.body;
      testResults = await testSpecificScenario(scenario);
    } else {
      console.log('❌ Invalid test type or missing parameters');
      return res.status(400).json({ error: 'Invalid test type or missing parameters' });
    }

    console.log('✅ Test results generated:', testResults.length, 'results');

    res.status(200).json({
      success: true,
      testType,
      totalTests: testResults.length,
      results: testResults,
      summary: generateTestSummary(testResults),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ 
      error: 'Test execution failed',
      details: error.message 
    });
  }
}

// Run all predefined test cases
async function runAllTestCases() {
  const testCases = [
    // Relaxation and Stress Relief
    {
      id: 'test-001',
      category: 'Relaxation',
      message: 'Hi! I\'m looking for something to help me relax after work. Any recommendations?',
      expectedIntents: ['relaxation'],
      expectedProducts: ['P002', 'P003', 'P005']
    },
    {
      id: 'test-002',
      category: 'Relaxation',
      message: 'I\'m feeling really stressed lately. What can help me calm down?',
      expectedIntents: ['relaxation'],
      expectedProducts: ['P002', 'P003', 'P005']
    },
    {
      id: 'test-003',
      category: 'Relaxation',
      message: 'Need something peaceful for my bedroom to unwind',
      expectedIntents: ['relaxation'],
      expectedProducts: ['P002', 'P003', 'P005']
    },

    // Tea and Beverages
    {
      id: 'test-004',
      category: 'Beverages',
      message: 'Do you have any organic teas? I prefer something healthy and natural.',
      expectedIntents: ['tea', 'wellness'],
      expectedProducts: ['P001', 'P006']
    },
    {
      id: 'test-005',
      category: 'Beverages',
      message: 'Looking for herbal tea for better sleep',
      expectedIntents: ['tea', 'sleep'],
      expectedProducts: ['P006', 'P002']
    },
    {
      id: 'test-006',
      category: 'Beverages',
      message: 'What green tea options do you have?',
      expectedIntents: ['tea'],
      expectedProducts: ['P001']
    },

    // Yoga and Fitness
    {
      id: 'test-007',
      category: 'Fitness',
      message: 'I need a yoga mat for my home practice. What do you recommend?',
      expectedIntents: ['fitness'],
      expectedProducts: ['P004']
    },
    {
      id: 'test-008',
      category: 'Fitness',
      message: 'Starting yoga classes, need equipment recommendations',
      expectedIntents: ['fitness'],
      expectedProducts: ['P004', 'P005']
    },
    {
      id: 'test-009',
      category: 'Fitness',
      message: 'Looking for fitness gear for home workouts',
      expectedIntents: ['fitness'],
      expectedProducts: ['P004']
    },

    // Aromatherapy
    {
      id: 'test-010',
      category: 'Aromatherapy',
      message: 'Looking for aromatherapy products for my office space.',
      expectedIntents: ['aromatherapy'],
      expectedProducts: ['P003', 'P002']
    },
    {
      id: 'test-011',
      category: 'Aromatherapy',
      message: 'Want to try essential oils for relaxation',
      expectedIntents: ['aromatherapy', 'relaxation'],
      expectedProducts: ['P003', 'P002']
    },
    {
      id: 'test-012',
      category: 'Aromatherapy',
      message: 'Need a diffuser for my living room',
      expectedIntents: ['aromatherapy'],
      expectedProducts: ['P003']
    },

    // Sleep and Insomnia
    {
      id: 'test-013',
      category: 'Sleep',
      message: 'Having trouble sleeping, what can help?',
      expectedIntents: ['sleep'],
      expectedProducts: ['P006', 'P002']
    },
    {
      id: 'test-014',
      category: 'Sleep',
      message: 'Need something for bedtime routine',
      expectedIntents: ['sleep'],
      expectedProducts: ['P006', 'P002', 'P003']
    },
    {
      id: 'test-015',
      category: 'Sleep',
      message: 'Insomnia is killing me, any natural solutions?',
      expectedIntents: ['sleep', 'wellness'],
      expectedProducts: ['P006', 'P002']
    },

    // Meditation and Mindfulness
    {
      id: 'test-016',
      category: 'Meditation',
      message: 'Starting meditation practice, need a cushion',
      expectedIntents: ['meditation'],
      expectedProducts: ['P005', 'P002']
    },
    {
      id: 'test-017',
      category: 'Meditation',
      message: 'Want to create a zen space at home',
      expectedIntents: ['meditation', 'relaxation'],
      expectedProducts: ['P005', 'P002', 'P003']
    },
    {
      id: 'test-018',
      category: 'Meditation',
      message: 'Looking for mindfulness products',
      expectedIntents: ['meditation'],
      expectedProducts: ['P005', 'P002']
    },

    // Wellness and Health
    {
      id: 'test-019',
      category: 'Wellness',
      message: 'Want to improve my overall wellness naturally',
      expectedIntents: ['wellness'],
      expectedProducts: ['P001', 'P002', 'P006']
    },
    {
      id: 'test-020',
      category: 'Wellness',
      message: 'Looking for natural health products',
      expectedIntents: ['wellness'],
      expectedProducts: ['P001', 'P002', 'P006']
    },

    // Complex/Combined Requests
    {
      id: 'test-021',
      category: 'Complex',
      message: 'I want to create a relaxing bedroom with tea and aromatherapy',
      expectedIntents: ['relaxation', 'tea', 'aromatherapy'],
      expectedProducts: ['P002', 'P003', 'P006', 'P001']
    },
    {
      id: 'test-022',
      category: 'Complex',
      message: 'Starting a wellness routine with yoga, meditation, and healthy drinks',
      expectedIntents: ['fitness', 'meditation', 'wellness'],
      expectedProducts: ['P004', 'P005', 'P001', 'P006']
    },
    {
      id: 'test-023',
      category: 'Complex',
      message: 'Need help with stress, sleep, and creating a peaceful home environment',
      expectedIntents: ['relaxation', 'sleep', 'wellness'],
      expectedProducts: ['P002', 'P003', 'P005', 'P006']
    },

    // Edge Cases
    {
      id: 'test-024',
      category: 'Edge Case',
      message: 'Hello',
      expectedIntents: [],
      expectedProducts: []
    },
    {
      id: 'test-025',
      category: 'Edge Case',
      message: 'I need something for my cat',
      expectedIntents: [],
      expectedProducts: []
    },
    {
      id: 'test-026',
      category: 'Edge Case',
      message: 'What\'s the weather like?',
      expectedIntents: [],
      expectedProducts: []
    }
  ];

  const results = [];
  
  for (const testCase of testCases) {
    const result = await runSingleTest(testCase);
    results.push(result);
  }

  return results;
}

// Test custom message
async function testCustomMessage(message) {
  console.log('🔍 testCustomMessage called with:', message);
  
  const testCase = {
    id: 'custom-test',
    category: 'Custom',
    message,
    expectedIntents: [],
    expectedProducts: []
  };

  console.log('🔍 Created test case:', testCase);
  const result = await runSingleTest(testCase);
  console.log('🔍 Single test result:', result);
  
  return [result];
}

// Test specific scenario
async function testSpecificScenario(scenario) {
  const scenarios = {
    'relaxation': [
      'I need to relax after a long day',
      'Feeling stressed and overwhelmed',
      'Want to create a calming atmosphere'
    ],
    'sleep': [
      'Having trouble falling asleep',
      'Need something for better sleep',
      'Insomnia is affecting my life'
    ],
    'fitness': [
      'Starting yoga practice',
      'Need fitness equipment for home',
      'Looking for workout gear'
    ],
    'wellness': [
      'Want to improve my health naturally',
      'Looking for wellness products',
      'Need natural health solutions'
    ]
  };

  const messages = scenarios[scenario] || [];
  const results = [];

  for (const message of messages) {
    const testCase = {
      id: `scenario-${scenario}-${Date.now()}`,
      category: scenario,
      message,
      expectedIntents: [scenario],
      expectedProducts: []
    };

    const result = await runSingleTest(testCase);
    results.push(result);
  }

  return results;
}

// Run a single test case
async function runSingleTest(testCase) {
  try {
    console.log('🔍 runSingleTest called with test case:', testCase);
    
    const apiUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/meshai/ai-recommendation`;
    console.log('🔍 Calling AI recommendation API:', apiUrl);
    
    const requestBody = {
      message: testCase.message,
      customerId: `test-${testCase.id}`
    };
    console.log('🔍 Request body:', requestBody);
    
    // Call the AI recommendation API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('🔍 API response status:', response.status);
    console.log('🔍 API response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ API error response:', errorText);
      throw new Error(`API call failed: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('🔍 API response data:', data);
    
    // Analyze the results
    const analysis = analyzeTestResults(testCase, data.recommendations);
    
    return {
      testId: testCase.id,
      category: testCase.category,
      message: testCase.message,
      expectedIntents: testCase.expectedIntents,
      expectedProducts: testCase.expectedProducts,
      actualResults: {
        products: data.recommendations.products.map(p => ({
          productId: p.productId,
          confidence: p.confidence,
          reason: p.primaryReason
        })),
        overallConfidence: data.recommendations.confidence,
        reasoning: data.recommendations.reasoning
      },
      analysis,
      passed: analysis.overallScore >= 0.7,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    return {
      testId: testCase.id,
      category: testCase.category,
      message: testCase.message,
      error: error.message,
      passed: false,
      timestamp: new Date().toISOString()
    };
  }
}

// Analyze test results
function analyzeTestResults(testCase, recommendations) {
  const analysis = {
    intentAccuracy: 0,
    productAccuracy: 0,
    confidenceScore: 0,
    overallScore: 0,
    details: {}
  };

  // Analyze intent accuracy (if we had intent detection results)
  // For now, we'll focus on product recommendations
  
  // Analyze product accuracy
  if (testCase.expectedProducts.length > 0) {
    const recommendedProductIds = recommendations.products.map(p => p.productId);
    const matchingProducts = testCase.expectedProducts.filter(expectedId => 
      recommendedProductIds.includes(expectedId)
    );
    analysis.productAccuracy = matchingProducts.length / testCase.expectedProducts.length;
    analysis.details.matchingProducts = matchingProducts;
    analysis.details.expectedProducts = testCase.expectedProducts;
    analysis.details.recommendedProducts = recommendedProductIds;
  } else {
    // For cases where no specific products are expected, check if recommendations are reasonable
    analysis.productAccuracy = recommendations.products.length > 0 ? 0.5 : 1.0;
  }

  // Analyze confidence score
  analysis.confidenceScore = recommendations.confidence || 0;

  // Calculate overall score
  analysis.overallScore = (analysis.productAccuracy * 0.7) + (analysis.confidenceScore * 0.3);

  return analysis;
}

// Generate test summary
function generateTestSummary(results) {
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;
  
  const categories = {};
  results.forEach(result => {
    if (!categories[result.category]) {
      categories[result.category] = { total: 0, passed: 0 };
    }
    categories[result.category].total++;
    if (result.passed) {
      categories[result.category].passed++;
    }
  });

  const categoryStats = Object.entries(categories).map(([category, stats]) => ({
    category,
    total: stats.total,
    passed: stats.passed,
    successRate: ((stats.passed / stats.total) * 100).toFixed(1) + '%'
  }));

  const avgConfidence = results
    .filter(r => r.actualResults?.overallConfidence)
    .reduce((sum, r) => sum + r.actualResults.overallConfidence, 0) / 
    results.filter(r => r.actualResults?.overallConfidence).length || 0;

  return {
    total,
    passed,
    failed,
    successRate: ((passed / total) * 100).toFixed(1) + '%',
    averageConfidence: avgConfidence.toFixed(3),
    categoryBreakdown: categoryStats,
    topPerformingCategories: categoryStats
      .sort((a, b) => parseFloat(b.successRate) - parseFloat(a.successRate))
      .slice(0, 3),
    needsImprovement: categoryStats
      .filter(c => parseFloat(c.successRate) < 70)
      .map(c => c.category)
  };
}
