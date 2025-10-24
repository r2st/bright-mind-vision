import React from 'react';
import Footer from '../../components/Footer';
import Contact from '../../components/Contact';
import Calendar from '../../components/Calendar';
import SEO from '../../components/SEO';
import dynamic from 'next/dynamic';

// Dynamic import for client-side component
const VoiceRealEstateService = dynamic(() => import('../../components/VoiceRealEstateService'), {
  ssr: false
});

const VoiceRealEstateServicePage = () => {
  return (
    <>
      <SEO 
        title="Voice Agent for Real Estate Customer Service"
        description="AI-powered voice assistant for real estate customer service. Automate property inquiries, schedule viewings, and provide 24/7 customer support for real estate agencies worldwide."
        keywords="voice AI, real estate AI, property automation, customer service AI, real estate voice assistant, property inquiries, viewing scheduling"
        url="https://brightmindvision.com/product/voice-real-estate-service"
      />

      <main>
        <VoiceRealEstateService />
      </main>

      <Contact />
      <Calendar />
      <Footer />
    </>
  );
};

export default VoiceRealEstateServicePage;

// Enable static generation
export async function getStaticProps() {
  return {
    props: {},
    revalidate: 60, // Revalidate every 60 seconds
  };
}