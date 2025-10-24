import React from 'react';
import ClinicLayout from '../../../components/ClinicLayout';
import SEO from '../../../components/SEO';
import dynamic from 'next/dynamic';

// Dynamic import for client-side component
const ClinicDashboard = dynamic(() => import('../../../components/ClinicDashboard'), {
  ssr: false
});

export default function ClinicPage() {
  return (
    <>
      <SEO 
        title="ClinicPro Dashboard - Voice Patient Onboarding Product"
        description="Product clinic management dashboard showcasing voice-powered patient onboarding system."
        keywords="clinic dashboard, patient onboarding, voice AI, clinic management, healthcare dashboard, medical AI"
        url="https://brightmindvision.com/product/clinic"
      />

      <ClinicLayout>
        <ClinicDashboard />
      </ClinicLayout>
    </>
  );
}

// Enable static generation
export async function getStaticProps() {
  return {
    props: {},
    revalidate: 60, // Revalidate every 60 seconds
  };
}