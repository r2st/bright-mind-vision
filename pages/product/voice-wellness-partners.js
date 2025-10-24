import React from 'react';
import Footer from '../../components/Footer';
import Contact from '../../components/Contact';
import Calendar from '../../components/Calendar';
import SEO from '../../components/SEO';
import dynamic from 'next/dynamic';

// Dynamic import for client-side component
const VoiceWellnessPartners = dynamic(() => import('../../components/VoiceWellnessPartners'), {
  ssr: false
});

const VoiceWellnessPartnersPage = () => {
  return (
    <>
      <SEO 
        title="Voice Wellness Partners Product"
        description="Voice-activated wellness partners booking product by Bright Mind Vision. Streamline wellness service bookings with AI-powered voice automation."
        keywords="voice AI, wellness booking, health services, voice assistant, wellness automation, health AI, booking system"
        url="https://brightmindvision.com/product/voice-wellness-partners"
      />

      <main>
        <VoiceWellnessPartners />
      </main>

      <Contact />
      <Calendar />
      <Footer />
    </>
  );
};

export default VoiceWellnessPartnersPage;

// Enable static generation
export async function getStaticProps() {
  return {
    props: {},
    revalidate: 60, // Revalidate every 60 seconds
  };
}