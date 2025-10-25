// Natural Language Generation Service for Human-like Recommendations
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Style configuration for different communication channels
export const STYLE_CONFIGS = {
  whatsapp: {
    persona: "friendly",
    verbosity: 2,
    emoji: 1,
    formality: "neutral",
    locale: "en-IN"
  },
  web: {
    persona: "expert",
    verbosity: 2,
    emoji: 0,
    formality: "polite",
    locale: "en-US"
  },
  mobile: {
    persona: "friendly",
    verbosity: 1,
    emoji: 2,
    formality: "casual",
    locale: "en-IN"
  }
};

// Pre-baked microcopy for natural variation
export const OPENING_TEMPLATES = {
  relaxation: [
    "Got it—winding down after busy days can be hard.",
    "Let's make evenings feel softer and less rushed.",
    "You're not alone—many people want a gentler wind-down.",
    "Finding calm after a long day can be tough—let's make it easier."
  ],
  sleep: [
    "Sleep struggles are so common—let's find what works for you.",
    "Getting quality rest shouldn't be this hard.",
    "Many people find it tough to switch off at night.",
    "Let's create a bedtime routine that actually works."
  ],
  organic: [
    "Going natural is a great choice for your wellness.",
    "Organic options can feel more gentle on your body.",
    "You're right to prioritize clean, natural ingredients.",
    "Natural products often feel more authentic and pure."
  ],
  luxury: [
    "You deserve something truly special for this occasion.",
    "Let's find something that matches your refined taste.",
    "Quality and craftsmanship make all the difference.",
    "Sometimes only the finest will do."
  ],
  wellness: [
    "Taking care of yourself is so important.",
    "Your wellness journey deserves the right support.",
    "Let's find products that truly serve your health goals.",
    "Self-care isn't selfish—it's essential."
  ]
};

export const CTA_TEMPLATES = {
  relaxation: [
    "Unscented or aromatherapy?",
    "Do you prefer gentle scents or no fragrance?",
    "Quick mood lift or longer routines?",
    "Immediate calm or building a routine?"
  ],
  sleep: [
    "Do you want non-habit forming options?",
    "Quick sleep aids or natural routines?",
    "Immediate help or building better habits?",
    "Gentle or stronger sleep support?"
  ],
  organic: [
    "Only certified organic or natural is okay?",
    "Strictly organic or natural alternatives?",
    "Certified organic or natural ingredients?",
    "Organic only or natural alternatives?"
  ],
  luxury: [
    "What's your budget range?",
    "Investment pieces or special occasion?",
    "Timeless classics or current trends?",
    "Signature pieces or statement items?"
  ],
  wellness: [
    "Quick wellness boost or long-term support?",
    "Daily essentials or special treatments?",
    "Prevention or maintenance focus?",
    "Quick wins or comprehensive approach?"
  ]
};

// System prompt for natural language generation
const SYSTEM_PROMPT = (style) => `
You're a helpful shopping assistant for luxury and wellness products.
Write natural, warm, concise replies that feel human and trustworthy.

Ground every claim strictly in provided product fields: id, name, benefits, is_organic, category, rating.
No medical claims. No invented features. No over-selling.

Style guidelines:
- Persona: ${style.persona} (friendly=warm and approachable, expert=knowledgeable and confident, concise=direct and efficient)
- Verbosity: ${style.verbosity} (1=brief one-liner per item, 2=moderate detail, 3=more context)
- Emoji: ${style.emoji} (0=none, 1=light use, 2=moderate use - never more than 1 emoji per line)
- Formality: ${style.formality} (casual=relaxed, neutral=balanced, polite=respectful)
- Locale: ${style.locale} (affects currency, spelling, cultural references)

Output ONLY valid JSON:
{
  "opening": "string",
  "items": [
    {"id": "string", "headline": "string", "one_liner": "string"}
  ],
  "cta": "string",
  "quick_replies": ["string", "string", "string"]
}
`;

// Natural response generation
export async function generateNaturalResponse({ userQuery, picks, style, intent }) {
  try {
    // Select appropriate opening template
    const openingTemplates = OPENING_TEMPLATES[intent] || OPENING_TEMPLATES.relaxation;
    const selectedOpening = openingTemplates[Math.floor(Math.random() * openingTemplates.length)];
    
    // Prepare content for Groq
    const content = JSON.stringify({
      user_query: userQuery,
      style,
      picks: picks.map(p => ({
        id: p.productId || p.id,
        name: p.product?.name || p.name,
        benefits: p.product?.benefits || p.benefits || [],
        is_organic: p.product?.is_organic || p.is_organic || false,
        category: p.product?.category || p.category,
        price: p.product?.price || p.price,
        rating: p.product?.rating || p.rating
      }))
    });

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.5,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT(style) },
        { role: "user", content }
      ]
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    // Post-process for safety and consistency
    const processedResult = await postProcessResponse(result, style, intent);
    
    return processedResult;
    
  } catch (error) {
    console.error('Natural response generation failed:', error);
    return generateFallbackResponse(picks, style, intent);
  }
}

// Post-process response for safety and consistency
async function postProcessResponse(result, style, intent) {
  // Safety: Replace medical claims with softer language
  if (result.items) {
    result.items.forEach(item => {
      if (item.one_liner) {
        item.one_liner = item.one_liner
          .replace(/\b(cures?|treats?|heals?|fixes?)\b/gi, "may help with")
          .replace(/\b(guarantees?|ensures?|promises?)\b/gi, "many people find")
          .replace(/\b(medical|clinical|therapeutic)\b/gi, "wellness")
          .slice(0, style.verbosity >= 3 ? 220 : 140);
      }
    });
  }

  // Ensure quick replies are actionable
  if (!Array.isArray(result.quick_replies) || result.quick_replies.length < 2) {
    const ctaTemplates = CTA_TEMPLATES[intent] || CTA_TEMPLATES.relaxation;
    result.quick_replies = [
      ctaTemplates[0] || "Tell me more",
      "Show different options",
      "What's your budget?"
    ];
  }

  // Limit quick replies to 3
  result.quick_replies = result.quick_replies.slice(0, 3);

  // Ensure opening is natural
  if (!result.opening || result.opening.length < 10) {
    const openingTemplates = OPENING_TEMPLATES[intent] || OPENING_TEMPLATES.relaxation;
    result.opening = openingTemplates[Math.floor(Math.random() * openingTemplates.length)];
  }

  return result;
}

// Fallback response when Groq fails
function generateFallbackResponse(picks, style, intent) {
  const openingTemplates = OPENING_TEMPLATES[intent] || OPENING_TEMPLATES.relaxation;
  const ctaTemplates = CTA_TEMPLATES[intent] || CTA_TEMPLATES.relaxation;
  
  return {
    opening: openingTemplates[0],
    items: picks.slice(0, 3).map((pick, index) => ({
      id: pick.productId || pick.id,
      headline: pick.product?.name || pick.name,
      one_liner: `Great choice for ${pick.product?.category || pick.category} needs.`
    })),
    cta: ctaTemplates[0],
    quick_replies: [
      "Tell me more",
      "Show different options", 
      "What's your budget?"
    ]
  };
}

// Format response for WhatsApp
export function formatForWhatsApp(naturalResponse, picks) {
  let message = `🤖 *AI Product Recommendations*\n\n`;
  message += `${naturalResponse.opening}\n\n`;
  
  naturalResponse.items.forEach((item, index) => {
    const pick = picks.find(p => (p.productId || p.id) === item.id);
    const price = pick?.product?.price || pick?.price || 0;
    const emoji = pick?.product?.image || pick?.image || '🛍️';
    
    message += `${index + 1}. ${emoji} *${item.headline}* - $${price}\n`;
    message += `   ${item.one_liner}\n\n`;
  });
  
  message += `💬 ${naturalResponse.cta}\n\n`;
  message += `Quick replies:\n`;
  naturalResponse.quick_replies.forEach((reply, index) => {
    message += `${index + 1}. ${reply}\n`;
  });
  
  return message;
}

// Format response for web interface
export function formatForWeb(naturalResponse, picks) {
  return {
    opening: naturalResponse.opening,
    items: naturalResponse.items.map(item => {
      const pick = picks.find(p => (p.productId || p.id) === item.id);
      return {
        ...item,
        product: pick?.product || pick,
        price: pick?.product?.price || pick?.price,
        image: pick?.product?.image || pick?.image
      };
    }),
    cta: naturalResponse.cta,
    quickReplies: naturalResponse.quick_replies
  };
}

// Get style config based on channel
export function getStyleConfig(channel = 'whatsapp') {
  return STYLE_CONFIGS[channel] || STYLE_CONFIGS.whatsapp;
}

// Detect intent from user query for appropriate templates
export function detectIntentForTemplates(userQuery) {
  const query = userQuery.toLowerCase();
  
  if (query.includes('sleep') || query.includes('insomnia') || query.includes('bedtime')) {
    return 'sleep';
  }
  if (query.includes('organic') || query.includes('natural') || query.includes('chemical-free')) {
    return 'organic';
  }
  if (query.includes('luxury') || query.includes('premium') || query.includes('exclusive')) {
    return 'luxury';
  }
  if (query.includes('wellness') || query.includes('health') || query.includes('fitness')) {
    return 'wellness';
  }
  if (query.includes('relax') || query.includes('stress') || query.includes('calm')) {
    return 'relaxation';
  }
  
  return 'relaxation'; // default
}
