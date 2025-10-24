import React from 'react';
import SEO from '../../../components/SEO';
import dynamic from 'next/dynamic';

// Dynamic import for client-side component
const RealEstateDashboard = dynamic(() => import('../../../components/RealEstateDashboard'), {
  ssr: false
});

export default function RealEstatePage() {
  return (
    <>
      <SEO 
        title="RealEstatePro Dashboard - Voice Real Estate Service"
        description="Real estate management dashboard showcasing voice-powered customer service system."
        keywords="real estate dashboard, property management, real estate AI, voice customer service, property automation"
        url="https://brightmindvision.com/product/real-estate"
      />

      <RealEstateDashboard />
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