
import { Button } from "@/components/ui/button";
import { CheckCircle, UserCheck, XCircle, Archive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import * as confetti from "canvas-confetti";

interface StatusButtonsProps {
  status: string;
  onStatusChange: (newStatus: string) => void;
}

export function StatusButtons({ status = 'lead', onStatusChange }: StatusButtonsProps) {
  const handleStatusChange = (newStatus: string) => {
    onStatusChange(newStatus);
    
    if (newStatus === 'partner' || newStatus === 'customer') {
      confetti.default({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      toast.success(
        newStatus === 'partner' ? 'Glückwunsch! Neuer Partner gewonnen!' : 'Glückwunsch! Neuer Kunde gewonnen!'
      );
    }
  };

  const getStatusConfig = (statusType: string) => {
    switch(statusType) {
      case 'partner':
        return { icon: UserCheck, color: 'bg-purple-500 hover:bg-purple-600', label: 'Partner' };
      case 'customer':
        return { icon: CheckCircle, color: 'bg-green-500 hover:bg-green-600', label: 'Kunde' };
      case 'not_for_now':
        return { icon: Archive, color: 'bg-orange-500 hover:bg-orange-600', label: 'Nicht jetzt' };
      case 'no_interest':
        return { icon: XCircle, color: 'bg-red-500 hover:bg-red-600', label: 'Kein Interesse' };
      default:
        return null;
    }
  };

  const currentConfig = getStatusConfig(status);

  return (
    <div className="flex gap-2 flex-wrap">
      {status === 'lead' ? (
        <>
          <Button
            variant="outline"
            size="sm"
            className="text-purple-600 border-purple-600 hover:bg-purple-50"
            onClick={() => handleStatusChange('partner')}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Partner
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-green-600 border-green-600 hover:bg-green-50"
            onClick={() => handleStatusChange('customer')}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Kunde
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-orange-600 border-orange-600 hover:bg-orange-50"
            onClick={() => handleStatusChange('not_for_now')}
          >
            <Archive className="h-4 w-4 mr-2" />
            Nicht jetzt
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-600 hover:bg-red-50"
            onClick={() => handleStatusChange('no_interest')}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Kein Interesse
          </Button>
        </>
      ) : currentConfig && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={`${currentConfig.color} text-white`}>
            <currentConfig.icon className="h-3 w-3 mr-1" />
            {currentConfig.label}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusChange('lead')}
          >
            Zurück zu Lead
          </Button>
        </div>
      )}
    </div>
  );
}
