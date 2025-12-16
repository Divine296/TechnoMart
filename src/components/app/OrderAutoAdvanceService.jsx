import { useOrderAutoAdvance } from '@/hooks/useOrderAutoAdvance';

/**
 * Background service component for auto-advancing orders
 * This component doesn't render anything - it just runs the auto-advance logic
 */
const OrderAutoAdvanceService = () => {
  useOrderAutoAdvance();
  return null;
};

export default OrderAutoAdvanceService;
