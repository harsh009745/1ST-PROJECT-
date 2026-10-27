import React from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { BookingSection } from '../components/BookingSection';
import { ServiceItem, BookingConfirmation } from '../types';

interface BookPageProps {
  services: ServiceItem[];
  onOpenSetupGuide: () => void;
  isGatewayConfigured?: boolean;
}

export const BookPage: React.FC<BookPageProps> = ({
  services,
  onOpenSetupGuide,
  isGatewayConfigured = true,
}) => {
  const [searchParams] = useSearchParams();
  const { packageId } = useParams<{ packageId?: string }>();
  const navigate = useNavigate();

  const activeServiceId = packageId || searchParams.get('service');

  // Re-order services so the selected package is prioritized at the top
  const sortedServices = React.useMemo(() => {
    if (!activeServiceId) return services;
    const target = services.find((s) => s.id === activeServiceId);
    if (!target) return services;
    return [target, ...services.filter((s) => s.id !== activeServiceId)];
  }, [services, activeServiceId]);

  const handlePaymentSuccess = (confirmation: BookingConfirmation) => {
    navigate(`/status?ref=${encodeURIComponent(confirmation.bookingReference)}`, {
      state: { confirmation },
    });
  };

  const handlePaymentFailure = (errorMessage: string) => {
    navigate(`/status?error=${encodeURIComponent(errorMessage)}`);
  };

  return (
    <div className="w-full py-12 animate-in fade-in">
      <BookingSection
        services={sortedServices}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailure={handlePaymentFailure}
        onOpenSetupGuide={onOpenSetupGuide}
        isGatewayConfigured={isGatewayConfigured}
      />
    </div>
  );
};
