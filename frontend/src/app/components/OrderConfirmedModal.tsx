interface OrderConfirmedModalProps {
  isOpen: boolean;
  orderId: string;
  contactMobile: string;
  onViewOrder: () => void;
  onContinueShopping: () => void;
}

function Sparkle({ filled }: { filled: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-teal-900"
      aria-hidden="true"
    >
      <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" />
    </svg>
  );
}

function SuccessCheckIcon() {
  return (
    <div className="flex justify-center mb-6">
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-[5px] border-emerald-500 flex items-center justify-center">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-emerald-500"
          aria-hidden="true"
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
  );
}

export function OrderConfirmedModal({
  isOpen,
  orderId,
  contactMobile,
  onViewOrder,
  onContinueShopping,
}: OrderConfirmedModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl px-8 py-10 sm:px-10 sm:py-12 text-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-confirmed-title"
      >
        <div className="flex justify-center items-center gap-3 mb-6" aria-hidden="true">
          <Sparkle filled />
          <Sparkle filled={false} />
          <Sparkle filled />
          <Sparkle filled={false} />
          <Sparkle filled />
        </div>

        <SuccessCheckIcon />

        <h2 id="order-confirmed-title" className="text-2xl sm:text-[1.75rem] font-bold text-teal-950 mb-5">
          Order Confirmed
        </h2>

        <div className="text-sm sm:text-base text-slate-600 leading-relaxed mb-10 space-y-1">
          <p>
            We have received your order{' '}
            <span className="font-semibold text-teal-950">#{orderId}</span>.
          </p>
          <p>
            Order updates will be sent to{' '}
            <span className="font-semibold text-teal-950">+91 {contactMobile}</span>.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button type="button" onClick={onViewOrder} className="btn-outline w-full py-3.5 text-sm sm:text-base">
            View order details
          </button>
          <button type="button" onClick={onContinueShopping} className="btn-primary w-full py-3.5 text-sm sm:text-base">
            Continue shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export type OrderConfirmedState = {
  orderId: string;
  contactMobile: string;
};
