import Head from 'next/head';
import { useFavicon } from './Favicon';

const SEO = ({
  title = "Bright Mind Vision - Transform your business with intelligent AI solutions",
  description = "Bright Mind Vision specializes in transforming your business with intelligent AI solutions. We create intelligent AI agents and automation solutions to transform your business operations.",
  keywords = "AI agents, artificial intelligence, business automation, AI development, intelligent agents, machine learning, Bright Mind Vision",
  author = "Bright Mind Vision",
  url = "https://brightmindvision.com",
  image = "https://brightmindvision.com/favicon.svg",
  type = "website",
  siteName = "Bright Mind Vision",
  robots = "index, follow",
  language = "English",
  revisitAfter = "7 days",
  canonical = null,
  noIndex = false,
  noFollow = false,
  customMeta = [],
  structuredData = null
}) => {
  // Use dynamic favicon hook
  useFavicon("#ffffff", 32, 6);
  
  // Construct full title
  const fullTitle = title.includes("Bright Mind Vision") ? title : `${title} | Bright Mind Vision`;
  
  // Construct canonical URL
  const canonicalUrl = canonical || url;
  
  // Construct robots content
  const robotsContent = noIndex || noFollow 
    ? `${noIndex ? 'noindex' : 'index'}, ${noFollow ? 'nofollow' : 'follow'}`
    : robots;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content={robotsContent} />
      <meta name="language" content={language} />
      <meta name="revisit-after" content={revisitAfter} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Favicon - Static SVG file */}
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="icon" href="/favicon.svg" />
      <meta name="theme-color" content="#667eea" />
      
      {/* Custom Meta Tags */}
      {customMeta.map((meta, index) => (
        <meta key={index} {...meta} />
      ))}
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      )}
    </Head>
  );
};

export default SEO;
