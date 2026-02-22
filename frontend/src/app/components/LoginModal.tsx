import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
    const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    useEffect(() => {
        if (isOpen) {
            setStep('mobile');
            setMobile('');
            setOtp('');
            setGeneratedOtp('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!/^\d{10}$/.test(mobile)) {
            toast.error('Please enter a valid 10-digit mobile number');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile })
            });

            const text = await response.text();
            let data: { message?: string } = {};
            try {
                data = text ? JSON.parse(text) : {};
            } catch {
                // Backend down or returned non-JSON - still show OTP step with dummy
                toast.info('Use dummy OTP: 1234');
                setIsLoading(false);
                setStep('otp');
                return;
            }

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send OTP');
            }

            toast.info('OTP Sent! Use dummy OTP: 1234');
            setIsLoading(false);
            setStep('otp');
        } catch (error: any) {
            // On network error, still allow OTP step
            if (/failed to fetch|network/i.test(error.message || '')) {
                toast.info('Backend offline. Use dummy OTP: 1234');
                setStep('otp');
                setOtp('1234');
            } else {
                toast.error(error.message);
            }
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 4) {
            toast.error('Please enter 4-digit OTP');
            return;
        }

        setIsLoading(true);
        try {
            await login(mobile, otp);
            setIsLoading(false);
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-full shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="p-6 md:p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {step === 'mobile' ? 'Login' : 'Verify OTP'}
                        </h2>
                        <p className="text-gray-600 mt-2">
                            {step === 'mobile'
                                ? 'Enter your mobile number to continue'
                                : `Enter the OTP sent to ${mobile}`
                            }
                        </p>
                    </div>

                    {step === 'mobile' ? (
                        <form onSubmit={handleSendOtp} className="space-y-4">
                            <div>
                                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                                    Mobile Number
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                                        +91
                                    </span>
                                    <input
                                        type="tel"
                                        id="mobile"
                                        value={mobile}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setMobile(val);
                                        }}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-600 transition-all outline-none"
                                        placeholder="Enter 10 digit number"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={mobile.length !== 10 || isLoading}
                                className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-600 text-white font-medium rounded-full transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    'Get OTP'
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (mobile.length === 10) {
                                        setStep('otp');
                                        setOtp('1234');
                                        toast.info('Use OTP: 1234');
                                    } else {
                                        toast.error('Enter 10-digit mobile first');
                                    }
                                }}
                                className="w-full py-2 text-sm text-amber-700 hover:text-amber-800 font-medium border border-amber-300 rounded-full hover:bg-amber-50"
                            >
                                Use demo OTP (1234) — skip Get OTP
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-full">
                                <p className="text-sm font-semibold text-amber-800">DUMMY OTP - USE NOW</p>
                                <p className="text-2xl font-bold text-amber-700 mt-1">1234</p>
                            </div>
                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                                    One Time Password
                                </label>
                                <input
                                    type="text"
                                    id="otp"
                                    value={otp}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                        setOtp(val);
                                    }}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-600 transition-all outline-none text-center text-lg tracking-widest"
                                    placeholder="Enter 1234"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setOtp('1234')}
                                    className="mt-2 text-sm text-blue-700 hover:text-blue-800 font-medium"
                                >
                                    Use dummy OTP 1234
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={otp.length !== 4 || isLoading}
                                className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-600 text-white font-medium rounded-full transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    'Verify & Proceed'
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep('mobile')}
                                className="w-full text-sm text-blue-700 hover:text-blue-800 hover:underline"
                            >
                                Change Mobile Number
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
