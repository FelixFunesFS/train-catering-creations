import { Download, Share, Plus, MoreVertical, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useEffect, useState } from 'react';

export default function Install() {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    setIsAndroid(/android/.test(userAgent));
  }, []);

  const handleInstallClick = async () => {
    if (isInstallable) {
      await promptInstall();
    }
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Already Installed!</CardTitle>
            <CardDescription>
              Soul Train's Eatery is already installed on your device. You can access it from your home screen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
            <img 
              src="/favicon.svg" 
              alt="Soul Train's Eatery" 
              className="w-12 h-12"
            />
          </div>
          <h1 className="text-3xl font-elegant font-bold mb-3">Install Soul Train's Eatery</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Add our app to your home screen for quick access to menus, quote requests, and your event portal.
          </p>
        </div>

        {/* Benefits */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Why Install?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Quick access from your home screen</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Works offline - view menus without internet</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Faster loading and better performance</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Full-screen experience without browser UI</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Direct Install Button (Chrome/Edge/etc) */}
        {isInstallable && (
          <Card className="mb-8 border-primary">
            <CardContent className="pt-6">
              <Button 
                onClick={handleInstallClick}
                className="w-full gap-2"
                size="lg"
              >
                <Download className="h-5 w-5" />
                Install Now
              </Button>
            </CardContent>
          </Card>
        )}

        {/* iOS Instructions */}
        {isIOS && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Share className="h-5 w-5" />
                Install on iPhone/iPad
              </CardTitle>
              <CardDescription>Follow these steps in Safari</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">1</span>
                  <div>
                    <p className="font-medium">Tap the Share button</p>
                    <p className="text-sm text-muted-foreground">Located at the bottom of Safari (the square with an arrow pointing up)</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">2</span>
                  <div>
                    <p className="font-medium">Scroll down and tap "Add to Home Screen"</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Plus className="h-4 w-4" /> Add to Home Screen
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">3</span>
                  <div>
                    <p className="font-medium">Tap "Add" in the top right</p>
                    <p className="text-sm text-muted-foreground">The app will appear on your home screen</p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Android Instructions */}
        {isAndroid && !isInstallable && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="h-5 w-5" />
                Install on Android
              </CardTitle>
              <CardDescription>Follow these steps in Chrome</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">1</span>
                  <div>
                    <p className="font-medium">Tap the menu button</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MoreVertical className="h-4 w-4" /> Three dots in the top right corner
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">2</span>
                  <div>
                    <p className="font-medium">Tap "Add to Home screen" or "Install app"</p>
                    <p className="text-sm text-muted-foreground">You may see either option depending on your browser</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">3</span>
                  <div>
                    <p className="font-medium">Tap "Add" or "Install"</p>
                    <p className="text-sm text-muted-foreground">The app icon will appear on your home screen</p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Desktop Instructions */}
        {!isIOS && !isAndroid && !isInstallable && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="h-5 w-5" />
                Install on Desktop
              </CardTitle>
              <CardDescription>Works in Chrome, Edge, and other modern browsers</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">1</span>
                  <div>
                    <p className="font-medium">Look for the install icon in your address bar</p>
                    <p className="text-sm text-muted-foreground">It may appear as a + or download icon on the right side</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">2</span>
                  <div>
                    <p className="font-medium">Click the icon and confirm</p>
                    <p className="text-sm text-muted-foreground">The app will open in its own window</p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Back to Home */}
        <div className="text-center">
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
