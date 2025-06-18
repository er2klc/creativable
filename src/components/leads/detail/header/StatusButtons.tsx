import { Button } from "@/components/ui/button";
import { Star, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";
import confetti from 'canvas-confetti';

interface StatusButtonsProps {
  status: string;
  onStatusChange: (newStatus: string) => void;
}

export function StatusButtons({ status, onStatusChange }: StatusButtonsProps) {
  const triggerPartnerAnimation = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4CAF50', '#8BC34A', '#CDDC39']
    });
  };

  const triggerCustomerAnimation = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2196F3', '#03A9F4', '#00BCD4']
    });
  };

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'partner' && status !== 'partner') {
      triggerPartnerAnimation();
    } else if (newStatus === 'customer' && status !== 'customer') {
      triggerCustomerAnimation();
    }
    onStatusChange(newStatus);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "transition-colors border-b-2",
          status === 'partner' ? 'border-b-green-500 text-green-700 hover:bg-green-50' : 'border-b-transparent'
        )}
        onClick={() => handleStatusChange('partner')}
      >
        <Star className="h-4 w-4 mr-2" />
        Partner
      </Button>
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "transition-colors border-b-2",
          status === 'customer' ? 'border-b-blue-500 text-blue-700 hover:bg-blue-50' : 'border-b-transparent'
        )}
        onClick={() => handleStatusChange('customer')}
      >
        <Star className="h-4 w-4 mr-2" />
        Kunde
      </Button>
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "transition-colors border-b-2",
          status === 'not_for_now' ? 'border-b-yellow-500 text-yellow-700 hover:bg-yellow-50' : 'border-b-transparent'
        )}
        onClick={() => handleStatusChange('not_for_now')}
      >
        <XCircle className="h-4 w-4 mr-2" />
        Not For Now
      </Button>
      <Button 
        variant="outline"
        size="sm"
        className={cn(
          "transition-colors border-b-2",
          status === 'no_interest' ? 'border-b-red-500 text-red-700 hover:bg-red-50' : 'border-b-transparent'
        )}
        onClick={() => handleStatusChange('no_interest')}
      >
        <XCircle className="h-4 w-4 mr-2" />
        Kein Interesse
      </Button>
    </div>
  );
}