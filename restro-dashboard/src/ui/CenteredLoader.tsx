import { useState, useEffect } from "react";

interface CenteredLoaderProps {
  type?: "spinner" | "bar" | "dots" | "pulse";
  isLoading?: boolean;
  text?: string;
  size?: "tiny" | "small" | "medium" | "large" | "xl";
  color?: "blue" | "red" | "green" | "yellow" | "purple" | "gray" | "white";
  showText?: boolean;
  withDelay?: boolean;
  delayMs?: number;
  fadeIn?: boolean;
  fadeOut?: boolean;
  blurIntensity?: "low" | "medium" | "high";
  overlayOpacity?: number;
  progress?: number;
  isDeterminate?: boolean;
  onLoadingStart?: () => void;
  onLoadingComplete?: () => void;
  textClassName?: string;
}

export default function CenteredLoader({
  type = "spinner",
  isLoading = true,
  text = "Loading...",
  size = "medium",
  color = "blue",
  showText = true,
  withDelay = false,
  delayMs = 300,
  fadeIn = true,
  fadeOut = true,
  blurIntensity = "medium",
  overlayOpacity = 50,
  progress = 0,
  isDeterminate = false,
  onLoadingStart = () => {},
  onLoadingComplete = () => {},
  textClassName = "",
}: CenteredLoaderProps) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  const sizeClasses: Record<
    string,
    { container: string; text: string; bar: string; dots: string }
  > = {
    tiny: {
      container: "h-4 w-4",
      text: "text-xs",
      bar: "h-1 w-16",
      dots: "h-1 w-1",
    },
    small: {
      container: "h-6 w-6",
      text: "text-sm",
      bar: "h-1.5 w-24",
      dots: "h-2 w-2",
    },
    medium: {
      container: "h-8 w-8",
      text: "text-base",
      bar: "h-2 w-32",
      dots: "h-3 w-3",
    },
    large: {
      container: "h-12 w-12",
      text: "text-lg",
      bar: "h-3 w-40",
      dots: "h-4 w-4",
    },
    xl: {
      container: "h-16 w-16",
      text: "text-xl",
      bar: "h-4 w-48",
      dots: "h-5 w-5",
    },
  };

  const colorClasses: Record<
    string,
    { text: string; bg: string; border: string; lighter: string }
  > = {
    blue: {
      text: "text-blue-600",
      bg: "bg-blue-600",
      border: "border-blue-600",
      lighter: "bg-blue-200",
    },
    red: {
      text: "text-red-600",
      bg: "bg-red-600",
      border: "border-red-600",
      lighter: "bg-red-200",
    },
    green: {
      text: "text-green-600",
      bg: "bg-green-600",
      border: "border-green-600",
      lighter: "bg-green-200",
    },
    yellow: {
      text: "text-yellow-600",
      bg: "bg-yellow-600",
      border: "border-yellow-600",
      lighter: "bg-yellow-200",
    },
    purple: {
      text: "text-purple-600",
      bg: "bg-purple-600",
      border: "border-purple-600",
      lighter: "bg-purple-200",
    },
    gray: {
      text: "text-gray-600",
      bg: "bg-gray-600",
      border: "border-gray-600",
      lighter: "bg-gray-200",
    },
    white: {
      text: "text-white",
      bg: "bg-white",
      border: "border-white",
      lighter: "bg-gray-100",
    },
  };

  const blurClasses: Record<string, string> = {
    low: "backdrop-blur-sm",
    medium: "backdrop-blur",
    high: "backdrop-blur-lg",
  };

  const getOpacityClass = (opacity: number): string => {
    const opacityRounded = Math.round(opacity / 10) * 10;
    return `bg-opacity-${opacityRounded}`;
  };

  useEffect(() => {
    if (isLoading) {
      if (withDelay) {
        const timer = setTimeout(() => {
          setVisible(true);
          onLoadingStart();
        }, delayMs);
        return () => clearTimeout(timer);
      } else {
        setVisible(true);
        onLoadingStart();
      }
    } else {
      if (fadeOut) {
        setVisible(false);
        const timer = setTimeout(() => {
          onLoadingComplete();
        }, 300);
        return () => clearTimeout(timer);
      } else {
        setVisible(false);
        onLoadingComplete();
      }
    }
  }, [
    isLoading,
    withDelay,
    delayMs,
    fadeOut,
    onLoadingStart,
    onLoadingComplete,
  ]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || (!visible && !isLoading)) {
    return null;
  }

  const transitionClass = `transition-opacity duration-300 ${fadeIn && !visible ? "opacity-0" : "opacity-100"}`;

  const renderSpinner = () => (
    <div
      className={`${sizeClasses[size].container} border-4 rounded-full ${colorClasses[color].lighter} border-t-transparent animate-spin ${transitionClass}`}
    ></div>
  );

  const renderBar = () => (
    <div
      className={`${sizeClasses[size].bar} bg-gray-200 rounded-full overflow-hidden ${transitionClass}`}
    >
      {isDeterminate ? (
        <div
          className={`h-full ${colorClasses[color].bg} transition-all duration-300 ease-in-out`}
          style={{ width: `${progress}%` }}
        ></div>
      ) : (
        <div
          className="w-1/3 h-full relative animate-pulse"
          style={{ backgroundColor: "currentColor" }}
        ></div>
      )}
    </div>
  );

  const renderDots = () => (
    <div className={`flex space-x-2 ${transitionClass}`}>
      {[0, 1, 2].map((dot) => (
        <div
          key={dot}
          className={`${sizeClasses[size].dots} rounded-full ${colorClasses[color].bg} animate-pulse`}
        ></div>
      ))}
    </div>
  );

  const renderPulse = () => (
    <div
      className={`${sizeClasses[size].container} rounded-full ${colorClasses[color].bg} animate-ping opacity-75 ${transitionClass}`}
    ></div>
  );

  const renderLoader = () => {
    switch (type) {
      case "bar":
        return renderBar();
      case "dots":
        return renderDots();
      case "pulse":
        return renderPulse();
      case "spinner":
      default:
        return renderSpinner();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${transitionClass}`}
    >
      <div
        className={`absolute inset-0 ${getOpacityClass(overlayOpacity)} ${blurClasses[blurIntensity]}`}
      ></div>
      <div className="relative z-10 flex flex-col items-center justify-center bg-white bg-opacity-20 rounded-lg p-8 shadow-lg">
        {renderLoader()}
        {showText && text && (
          <p
            className={`mt-4 ${colorClasses[color].text} ${sizeClasses[size].text} ${textClassName} font-medium`}
          >
            {text}
          </p>
        )}
      </div>
    </div>
  );
}
