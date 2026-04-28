import Lottie from 'lottie-react';
import { useEffect, useState } from 'react';

interface ComingSoonProps {
  title?: string;
  message?: string;
  className?: string;
}

export function ComingSoon({
  title = 'Coming Soon',
  message = "We're working on something awesome! Stay tuned.",
  className = '',
}: ComingSoonProps) {
  const [animationData, setAnimationData] = useState<unknown>(null);

  useEffect(() => {
    fetch('/lotties/coming-soon.json')
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch(err => {
        console.error('Failed to load Lottie animation:', err);
      });
  }, []);

  if (!animationData) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}>
        <div className="w-64 h-64 md:w-80 md:h-80 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-6 text-center">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-center max-w-md">{message}</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}>
      <div className="w-64 h-64 md:w-80 md:h-80">
        <Lottie animationData={animationData} loop={true} autoplay={true} />
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-6 text-center">
        {title}
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mt-2 text-center max-w-md">{message}</p>
    </div>
  );
}
