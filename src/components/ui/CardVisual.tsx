import type { Card } from '../../bank/types';
import { formatCardNumber, maskCard } from '../../bank/format';
import { LogoIcon } from '../LogoIcon';

interface CardVisualProps {
  card: Card;
  reveal?: boolean;
}

const GRADIENTS: Record<Card['network'], string> = {
  visa: 'linear-gradient(135deg, #1a1a2e 0%, #2B2644 50%, #4a3f6b 100%)',
  mastercard: 'linear-gradient(135deg, #000 0%, #1f1f1f 60%, #3a3a3a 100%)',
};

export function CardVisual({ card, reveal = false }: CardVisualProps) {
  const numberDisplay = reveal ? formatCardNumber(card.number) : maskCard(card.number);
  return (
    <div
      className={`relative w-full aspect-[1.586/1] rounded-2xl p-6 text-white shadow-lg overflow-hidden ${
        card.frozen ? 'opacity-60' : ''
      }`}
      style={{ background: GRADIENTS[card.network] }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <LogoIcon className="w-6 h-6 text-white" />
          <span className="text-base font-medium">Halo</span>
        </div>
        <div className="text-xs uppercase tracking-widest text-white/70">
          {card.type}
        </div>
      </div>

      <div className="mt-10 font-mono text-lg tracking-widest">{numberDisplay}</div>

      <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-white/50">Card holder</div>
          <div className="text-sm font-medium mt-0.5">{card.holder}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-white/50">Expires</div>
          <div className="text-sm font-medium mt-0.5">{card.expiry}</div>
        </div>
        <div className="text-lg font-bold italic">
          {card.network === 'visa' ? 'VISA' : 'MC'}
        </div>
      </div>

      {card.frozen && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
          <span className="text-white text-sm font-medium uppercase tracking-widest">
            Frozen
          </span>
        </div>
      )}
    </div>
  );
}
