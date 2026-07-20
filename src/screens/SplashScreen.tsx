import { useEffect, useState } from 'react';
import { Shirt } from 'lucide-react';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [logoScale, setLogoScale] = useState(false);

  useEffect(() => {
    setTimeout(() => setLogoScale(true), 200);
    setTimeout(() => onComplete(), 1500);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-primary-500 flex flex-col items-center justify-center">
      <div
        className={`transform transition-all duration-500 ${
          logoScale ? 'scale-110 opacity-100' : 'scale-75 opacity-80'
        }`}
      >
        <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
          <Shirt className="w-12 h-12 text-white" strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Shirtify</h1>
      </div>
      <div className="mt-12">
        <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    </div>
  );
}
