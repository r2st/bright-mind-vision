import Head from 'next/head'
import Script from 'next/script'
import Header from '@components/Header'
import Footer from '@components/Footer'
import Contact from '@components/Contact'
import Calendar from '@components/Calendar'

export default function Projects() {
  const projects = [
    {
      id: 1,
      title: "Advanced AI Platform for E-commerce Personalization",
      category: "E-commerce & AI",
      description: "Developed and enhanced an AI-driven platform using PyTorch, TensorFlow, and Hugging Face Transformers for product recommendations and personalization in digital commerce.",
      technologies: ["PyTorch", "TensorFlow", "Hugging Face Transformers", "FastAPI", "Apache Kafka", "Apache Spark", "PostgreSQL", "MLflow", "Kubernetes"],
      features: [
        "Integrated with PIM and DAM systems for streamlined workflows",
        "NLP models with spaCy and Transformers for enhanced search functionality",
        "Scalable data pipelines for large-scale retail data handling",
        "AI-driven advertising and multilingual campaigns",
        "Real-time data integration for operational efficiency",
        "Seamless integration with PIM, ERP, and social commerce platforms"
      ],
      impact: "Improved customer experience, enhanced product discoverability, and drove data-driven decision-making for marketing and merchandising strategies."
    },
    {
      id: 2,
      title: "Voice Agent for Customer Service",
      category: "Conversational AI",
      description: "Developed an integrated voice agent using LangChain for adaptive agent building, incorporating advanced function calling and memory management to handle customer calls across multiple sectors.",
      technologies: ["LangChain", "Sentence Transformers", "FAISS", "NumPy", "Deepgram", "Google Speech", "Silero"],
      features: [
        "Adaptive agent building with advanced function calling",
        "Dynamic retrieval-augmented generation pipeline",
        "High-quality text-to-speech conversion with Deepgram",
        "Precise speech-to-text conversion with Google Speech",
        "Robust voice activity detection with Silero",
        "Real-time audio processing workflows"
      ],
      impact: "Enhanced customer engagement across hotels, restaurants, airlines, and hospitals with seamless, context-aware voice interactions."
    },
    {
      id: 3,
      title: "AI-Powered Stateful Fuzzing and Smart Contract Auditing",
      category: "Blockchain Security",
      description: "Developed and implemented stateful fuzzing techniques to identify complex vulnerabilities in smart contracts, focusing on economic risk and security exploits.",
      technologies: ["Python", "Ethereum", "Rust", "Machine Learning", "Smart Contract Analysis"],
      features: [
        "Stateful fuzzing engine for dynamic analysis of DeFi protocols",
        "Custom test oracles for economic risk detection",
        "MEV and zero-day exploit identification",
        "Algorithmic parsing for action sequences and state transitions",
        "Smart contract simulations for comprehensive testing",
        "Machine learning models for prioritizing high-risk sequences"
      ],
      impact: "Enhanced security auditing capabilities for decentralized finance protocols, reducing vulnerabilities and economic risks in smart contracts."
    },
    {
      id: 4,
      title: "AI-Powered Companion Platform",
      category: "Multimodal AI",
      description: "Developed an AI-Powered Companion Platform with emotion recognition, natural language processing, and multimodal interaction capabilities.",
      technologies: ["BERT", "CNNs", "GPT Models", "Speech-to-Text", "Text-to-Speech", "Video Analysis"],
      features: [
        "Text, voice, and video-based emotion detection",
        "Context-aware and emotion-sensitive responses",
        "Conversation history and user preference tracking",
        "Multimodal interaction through text, voice, and visual elements",
        "External API integration for enhanced services",
        "Continuous learning from user feedback"
      ],
      impact: "Created personalized AI interactions that adapt to user emotions and preferences, providing a seamless and engaging companion experience."
    },
    {
      id: 5,
      title: "ULALO - Smart Patient Wallet",
      category: "Healthcare Blockchain",
      description: "A decentralized Smart Patient Wallet built on blockchain technology that empowers patients to securely store, manage, and share their complete medical history while maintaining full control over their health data.",
      technologies: ["Blockchain", "OCR Technology", "Biometric Authentication", "2FA", "ERC712", "LLM", "Apple Health API", "Cloud Storage"],
      features: [
        "Secure biometric authentication and two-factor authentication",
        "Smartphone camera scanning for medical documents",
        "Automatic data extraction using OCR technology",
        "Decentralized storage on distributed ledger",
        "Complete patient ownership and control of medical data",
        "Global healthcare provider data sharing",
        "Data visualization and health trend monitoring",
        "Cloud backup and recovery options",
        "LLM-powered health analysis and recommendations",
        "Multilanguage translation for global travelers",
        "Integration with Apple Health Records API",
        "Medical insurance subscription for relatives abroad"
      ],
      impact: "Revolutionized healthcare data management by providing patients with complete control over their medical records, enabling seamless global healthcare access and improving care coordination across providers.",
      links: {
        website: "https://ulalo.xyz/",
        youtube: "https://www.youtube.com/@ULALO_IO"
      }
    }
  ]

  return (
    <div className="container">
      <Head>
        <title>Projects - Bright Mind Vision</title>
        <meta name="description" content="Explore our portfolio of AI-powered projects including e-commerce personalization, conversational AI, blockchain security, and multimodal AI solutions." />
        <meta name="keywords" content="AI projects, machine learning projects, blockchain AI, conversational AI, e-commerce AI, smart contracts, ULALO, AI portfolio" />
        <meta name="author" content="Bright Mind Vision" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Projects - Bright Mind Vision" />
        <meta property="og:description" content="Explore our portfolio of AI-powered projects including e-commerce personalization, conversational AI, blockchain security, and multimodal AI solutions." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://brightmindvision.com/projects" />
        <meta property="og:image" content="https://brightmindvision.com/bmv-logo.png" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Projects - Bright Mind Vision" />
        <meta name="twitter:description" content="Explore our portfolio of AI-powered projects including e-commerce personalization, conversational AI, blockchain security, and multimodal AI solutions." />
        <meta name="twitter:image" content="https://brightmindvision.com/bmv-logo.png" />
        
        <link rel="icon" href="/bmv_favicon.png" />
        <link rel="canonical" href="https://brightmindvision.com/projects" />
      </Head>

      <Header />

      {/* Calendly Script */}
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
      />
      
      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <div className="hero-logo">
              <img src="/bmv-logo-hero.png" alt="Bright Mind Vision" className="hero-logo-image" />
            </div>
            <h1 className="hero-title">Our AI Projects</h1>
            <p className="hero-subtitle">Explore our portfolio of cutting-edge AI solutions</p>
            <p className="hero-description">From e-commerce personalization to blockchain security, we deliver innovative AI technologies that have transformed businesses across various industries and drive real results.</p>
            <div className="hero-actions">
              <a href="/#services" className="cta-button primary">Our Services</a>
              <a href="/#contact" className="cta-button secondary">Get In Touch</a>
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="section">
          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project.id} className="project-card">
                <div className="project-header">
                  <div className="project-category">{project.category}</div>
                  <h3 className="project-title">{project.title}</h3>
                </div>
                
                <p className="project-description">{project.description}</p>
                
                <div className="project-technologies">
                  <h4>Technologies Used:</h4>
                  <div className="tech-tags">
                    {project.technologies.map((tech, index) => (
                      <span key={index} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                </div>
                
                <div className="project-features">
                  <h4>Key Features:</h4>
                  <ul>
                    {project.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="project-impact">
                  <h4>Impact:</h4>
                  <p>{project.impact}</p>
                </div>
                
                {project.links && (
                  <div className="project-links">
                    <h4>Links:</h4>
                    <div className="link-buttons">
                      {project.links.website && (
                        <a href={project.links.website} target="_blank" rel="noopener noreferrer" className="link-button">
                          🌐 Website
                        </a>
                      )}
                      {project.links.youtube && (
                        <a href={project.links.youtube} target="_blank" rel="noopener noreferrer" className="link-button">
                          📺 YouTube
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <Contact />
        <Calendar />
      </main>

      <Footer />
    </div>
  )
}
