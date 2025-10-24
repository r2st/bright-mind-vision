import React from 'react';
import Footer from '../../components/Footer';
import Contact from '../../components/Contact';
import Calendar from '../../components/Calendar';
import SEO from '../../components/SEO';
import dynamic from 'next/dynamic';

// Dynamic import for client-side component
const VoicePatientOnboarding = dynamic(() => import('../../components/VoicePatientOnboarding'), {
  ssr: false
});

const VoicePatientOnboardingPage = () => {
  return (
    <>
      <SEO 
        title="Voice Agent for Patient Onboarding - Private Clinics"
        description="Voice-enabled assistant for streamlining patient appointment process in private clinics worldwide. Automated patient onboarding and appointment management."
        keywords="voice AI, patient onboarding, clinic automation, healthcare AI, appointment scheduling, voice assistant, medical AI"
        url="https://brightmindvision.com/product/voice-patient-onboarding"
      />

      <main>
        <VoicePatientOnboarding />
      </main>

      <Contact />
      <Calendar />
      <Footer />
    </>
  );
};

export default VoicePatientOnboardingPage;

// Enable static generation
export async function getStaticProps() {
  return {
    props: {},
    revalidate: 60, // Revalidate every 60 seconds
  };
}