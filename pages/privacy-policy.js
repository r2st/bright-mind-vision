import React from 'react';
import Head from 'next/head';
import styles from '../styles/PrivacyPolicy.module.css';

const PrivacyPolicy = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy - Meshai WhatsApp Integration</title>
        <meta name="description" content="Privacy Policy for Meshai WhatsApp Business Integration" />
        <meta name="robots" content="index, follow" />
      </Head>
      
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.lastUpdated}>Last updated: {new Date().toLocaleDateString()}</p>
          
          <section className={styles.section}>
            <h2>1. Introduction</h2>
            <p>
              This Privacy Policy describes how Meshai ("we," "our," or "us") collects, uses, and shares information 
              when you interact with our WhatsApp Business integration service. This service provides AI-powered product 
              recommendations through WhatsApp messaging.
            </p>
          </section>

          <section className={styles.section}>
            <h2>2. Information We Collect</h2>
            <h3>2.1 WhatsApp Messages</h3>
            <p>We collect and process the following information:</p>
            <ul>
              <li><strong>Message Content:</strong> Text messages you send to our WhatsApp Business number</li>
              <li><strong>Phone Number:</strong> Your WhatsApp phone number for communication purposes</li>
              <li><strong>Message Timestamps:</strong> When messages are sent and received</li>
              <li><strong>Message IDs:</strong> Unique identifiers for message tracking</li>
            </ul>

            <h3>2.2 AI Processing Data</h3>
            <p>To provide personalized product recommendations, we analyze:</p>
            <ul>
              <li>Message content to understand your interests and preferences</li>
              <li>Product interaction patterns to improve recommendations</li>
              <li>Communication history to provide contextual responses</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>3. How We Use Your Information</h2>
            <p>We use the collected information for the following purposes:</p>
            <ul>
              <li><strong>Product Recommendations:</strong> To provide personalized product suggestions based on your messages</li>
              <li><strong>Customer Service:</strong> To respond to your inquiries and provide support</li>
              <li><strong>Service Improvement:</strong> To enhance our AI recommendation algorithms</li>
              <li><strong>Communication:</strong> To send you relevant product information and updates</li>
              <li><strong>Analytics:</strong> To understand usage patterns and improve our service</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>4. Information Sharing</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share information only in the following circumstances:</p>
            <ul>
              <li><strong>Service Providers:</strong> With trusted third-party services that help us operate our business (e.g., cloud hosting, analytics)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>Consent:</strong> When you explicitly consent to sharing your information</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>5. Data Security</h2>
            <p>We implement appropriate security measures to protect your information:</p>
            <ul>
              <li><strong>Encryption:</strong> All data is encrypted in transit and at rest</li>
              <li><strong>Access Controls:</strong> Limited access to personal information on a need-to-know basis</li>
              <li><strong>Regular Audits:</strong> Regular security assessments and updates</li>
              <li><strong>Secure Infrastructure:</strong> Industry-standard security practices and protocols</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>6. Data Retention</h2>
            <p>We retain your information for the following periods:</p>
            <ul>
              <li><strong>Message Data:</strong> Up to 2 years for service improvement and analytics</li>
              <li><strong>User Preferences:</strong> Until you request deletion or opt out</li>
              <li><strong>Analytics Data:</strong> Aggregated and anonymized data may be retained longer</li>
            </ul>
            <p>You can request deletion of your data at any time by contacting us.</p>
          </section>

          <section className={styles.section}>
            <h2>7. Your Rights</h2>
            <p>You have the following rights regarding your personal information:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request transfer of your data to another service</li>
              <li><strong>Objection:</strong> Object to processing of your personal information</li>
              <li><strong>Withdrawal of Consent:</strong> Withdraw consent for data processing at any time</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>8. WhatsApp Integration</h2>
            <p>Our service integrates with WhatsApp Business API and follows WhatsApp's data protection standards:</p>
            <ul>
              <li>We comply with WhatsApp's Business Policy and Terms of Service</li>
              <li>Message data is processed according to WhatsApp's data processing guidelines</li>
              <li>We use WhatsApp's official API for all communications</li>
              <li>Your WhatsApp account information is handled according to WhatsApp's privacy practices</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>9. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place for international transfers, including:
            </p>
            <ul>
              <li>Standard contractual clauses approved by relevant authorities</li>
              <li>Adequacy decisions by data protection authorities</li>
              <li>Other appropriate safeguards as required by law</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>10. Children's Privacy</h2>
            <p>
              Our service is not intended for children under 13 years of age. We do not knowingly collect 
              personal information from children under 13. If we become aware that we have collected personal 
              information from a child under 13, we will take steps to delete such information.
            </p>
          </section>

          <section className={styles.section}>
            <h2>11. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes 
              by posting the new Privacy Policy on this page and updating the "Last updated" date. 
              Your continued use of our service after any changes constitutes acceptance of the updated Privacy Policy.
            </p>
          </section>

          <section className={styles.section}>
            <h2>12. Contact Information</h2>
            <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
            <div className={styles.contactInfo}>
              <p><strong>Email:</strong> privacy@meshaiservice.com</p>
              <p><strong>WhatsApp:</strong> +1-XXX-XXX-XXXX</p>
              <p><strong>Address:</strong> Bright Mind Vision, Privacy Department</p>
            </div>
          </section>

          <section className={styles.section}>
            <h2>13. Compliance</h2>
            <p>This Privacy Policy complies with:</p>
            <ul>
              <li>General Data Protection Regulation (GDPR)</li>
              <li>California Consumer Privacy Act (CCPA)</li>
              <li>WhatsApp Business Policy</li>
              <li>Facebook Platform Policy</li>
              <li>Other applicable data protection laws</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
