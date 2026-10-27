import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MobileStickyCTA } from './components/MobileStickyCTA';
import { ScrollToTop } from './components/ScrollToTop';
import { GatewaySetupModal } from './components/GatewaySetupModal';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { PillarDetailPage } from './pages/PillarDetailPage';
import { PackageDetailPage } from './pages/PackageDetailPage';
import { BookPage } from './pages/BookPage';
import { MethodPage } from './pages/MethodPage';
import { StatusPage } from './pages/StatusPage';
import { PoliciesPage } from './pages/PoliciesPage';
import { AboutPage } from './pages/AboutPage';
import { FaqPage } from './pages/FaqPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { ContactPage } from './pages/ContactPage';
import { PaymentPage } from './pages/PaymentPage';

// Authentication & Account Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { AccountPage } from './pages/AccountPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

import { ServiceItem, GatewayConfig } from './types';

export const App: React.FC = () => {
  // Service Catalog & Gateway state
  const [services, setServices] = useState<ServiceItem[]>([
    {
      id: 'complete-45',
      name: 'Comprehensive 1:1 Aesthetics & Grooming Consultation',
      duration: '45 mins',
      durationMinutes: 45,
      description:
        'Complete private video session covering facial aesthetics, hairstyle geometry, skincare protocol, and personal style blueprint.',
      fullDescription:
        'A holistic 45-minute private video session analyzing facial framing, hair texture and styling options, skin condition and ingredients, facial hair trim lines, and outfit silhouettes tailored specifically to your goals.',
      basePriceINR: 1999,
      badge: 'Most Popular',
      features: [
        'Facial structure & hairstyle geometry assessment',
        'Morning & evening skincare routine audit',
        'Beard / stubble line framing advice',
        'Wardrobe silhouette & color palette review',
        'Follow-up written action blueprint PDF',
      ],
    },
    {
      id: 'hair-grooming-45',
      name: 'Hairstyle & Facial Grooming Intensive',
      duration: '45 mins',
      durationMinutes: 45,
      description:
        'Deep dive into head shape, optimal hair length, styling product selection, and facial hair grooming.',
      fullDescription:
        'Dedicated 45-minute video breakdown of your hair type, hairline, cowlicks, and bone structure. We select realistic haircut references to show your barber, along with precise beard grooming lines.',
      basePriceINR: 1499,
      badge: 'Hair & Beard Focus',
      features: [
        'Hairline, density & face shape framing review',
        'Reference cuts & instructions for your barber',
        'Pomade, clay & styling product recommendations',
        'Jawline enhancement through beard grooming',
      ],
    },
    {
      id: 'skincare-style-45',
      name: 'Skincare Routine & Personal Styling Blueprint',
      duration: '45 mins',
      durationMinutes: 45,
      description:
        'Science-backed daily skincare formulation, presentation hygiene, and tailored clothing fit recommendations.',
      fullDescription:
        'Focused 45-minute consultation addressing skin texture, acne-prone or barrier issues, sunscreen and retinoid protocols, plus personal styling tips to enhance your posture and proportions.',
      basePriceINR: 1499,
      badge: 'Skin & Style Focus',
      features: [
        'Skin type & current routine product audit',
        'Active ingredients guide (cleanser, retinol, SPF)',
        'Wardrobe essentials based on build and height',
        'Posture, scent & presentation refinement',
      ],
    },
  ]);

  const [isGatewayConfigured, setIsGatewayConfigured] = useState<boolean>(false);
  const [isSetupGuideOpen, setIsSetupGuideOpen] = useState<boolean>(false);

  // Fetch server configuration on mount
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/checkout/config');
        if (res.ok) {
          const data: GatewayConfig = await res.json();
          setIsGatewayConfigured(data.configured);
          if (data.services && data.services.length > 0) {
            setServices(data.services);
          }
        }
      } catch (err) {
        console.warn('Could not fetch server config:', err);
      }
    }
    loadConfig();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col justify-between selection:bg-amber-400 selection:text-zinc-950 font-sans antialiased overflow-x-hidden">
          {/* Ambient background lighting */}
          <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(212,175,55,0.06),rgba(255,255,255,0))]" />
          <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_bottom,rgba(212,175,55,0.03),transparent_70%)]" />

          {/* Global Navigation Bar */}
          <Navbar
            onOpenSetupGuide={() => setIsSetupGuideOpen(true)}
            isGatewayConfigured={isGatewayConfigured}
          />

          {/* Multi-Page Route Switcher */}
          <main className="flex-1 w-full relative z-10">
            <Routes>
              {/* Core Pages */}
              <Route path="/" element={<HomePage services={services} />} />
              <Route path="/services" element={<ServicesPage services={services} />} />

              {/* Individual Pillar Pages with Dedicated URLs */}
              <Route path="/pillars/:pillarId" element={<PillarDetailPage />} />

              {/* Individual Package Detail Pages with Dedicated URLs */}
              <Route
                path="/packages/:packageId"
                element={<PackageDetailPage services={services} />}
              />

              {/* Booking Studio (general and per-package) */}
              <Route
                path="/book"
                element={
                  <BookPage
                    services={services}
                    onOpenSetupGuide={() => setIsSetupGuideOpen(true)}
                    isGatewayConfigured={isGatewayConfigured}
                  />
                }
              />
              <Route
                path="/book/:packageId"
                element={
                  <BookPage
                    services={services}
                    onOpenSetupGuide={() => setIsSetupGuideOpen(true)}
                    isGatewayConfigured={isGatewayConfigured}
                  />
                }
              />

              {/* Dedicated Payment & Checkout Page */}
              <Route
                path="/payment"
                element={
                  <PaymentPage
                    services={services}
                    isGatewayConfigured={isGatewayConfigured}
                  />
                }
              />
              <Route
                path="/checkout"
                element={
                  <PaymentPage
                    services={services}
                    isGatewayConfigured={isGatewayConfigured}
                  />
                }
              />

              {/* Authentication Flow */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Protected User Area */}
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <AccountPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Administrator Console */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* The 45-Min Methodology */}
              <Route path="/method" element={<MethodPage />} />

              {/* Appointment Lookup & Meeting Room */}
              <Route path="/status" element={<StatusPage />} />
              <Route path="/status/:bookingReference" element={<StatusPage />} />
              <Route path="/confirmation/:bookingReference" element={<StatusPage />} />

              {/* Informational & Policy Sub-Pages */}
              <Route path="/policies" element={<PoliciesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/contact" element={<ContactPage />} />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Global Footer */}
          <Footer
            onOpenSetupGuide={() => setIsSetupGuideOpen(true)}
            isGatewayConfigured={isGatewayConfigured}
          />

          {/* Contextual Mobile Sticky CTA Bar */}
          <MobileStickyCTA startingPriceINR={services[1]?.basePriceINR || 1499} />

          {/* Razorpay Gateway Setup Guide Drawer */}
          <GatewaySetupModal
            isOpen={isSetupGuideOpen}
            onClose={() => setIsSetupGuideOpen(false)}
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
