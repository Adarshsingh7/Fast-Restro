import { useState } from "react";
import {
  AlertCircle,
  Frown,
  RefreshCw,
  Home,
  ServerCrash,
  FileX,
} from "lucide-react";

// Define TypeScript interface for props
interface ErrorPageProps {
  // Error details
  errorCode?: number;
  title?: string;
  description?: string;
  details?: string;

  // Customization
  icon?: "frown" | "server-crash" | "file-not-found";
  showRefreshButton?: boolean;
  showHomeButton?: boolean;

  // Actions
  onRefresh?: () => void;
  onGoHome?: () => void;
  homeButtonText?: string;
  refreshButtonText?: string;
}

export default function ErrorPage({
  // Default values for props
  errorCode = 404,
  title = "Oops! Something went wrong",
  description = "We couldn't find the page you're looking for or encountered a server error.",
  details = "Page not found or server unavailable",
  icon = "frown",
  showRefreshButton = true,
  showHomeButton = true,
  onRefresh,
  onGoHome,
  homeButtonText = "Go Home",
  refreshButtonText = "Refresh Page",
}: ErrorPageProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Determine which icon to display
  const renderIcon = () => {
    switch (icon) {
      case "server-crash":
        return <ServerCrash className="h-10 w-10 text-muted-foreground" />;
      case "file-not-found":
        return <FileX className="h-10 w-10 text-muted-foreground" />;
      default:
        return <Frown className="h-10 w-10 text-muted-foreground" />;
    }
  };

  // Handle refresh click with custom callback option
  const handleRefresh = () => {
    setIsLoading(true);

    if (onRefresh) {
      onRefresh();
      // Reset loading state after a delay if custom handler doesn't handle it
      setTimeout(() => setIsLoading(false), 1500);
    } else {
      // Default refresh behavior
      setTimeout(() => {
        window.location.reload();
        setIsLoading(false);
      }, 1500);
    }
  };

  // Handle home button click
  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      // Default home behavior - go to root
      window.location.href = "/";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Error Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          {renderIcon()}
        </div>

        {/* Error Message */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>

        {/* Error Details Card */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-row items-center p-4 gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div className="text-left">
              <h4 className="font-semibold">Error Code: {errorCode}</h4>
              <p className="text-sm text-muted-foreground">{details}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {(showRefreshButton || showHomeButton) && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {showRefreshButton && (
              <button
                onClick={handleRefresh}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {refreshButtonText}
                  </>
                )}
              </button>
            )}

            {showHomeButton && (
              <button
                onClick={handleGoHome}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                <Home className="mr-2 h-4 w-4" />
                {homeButtonText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
