import { useState } from 'react';
import { Navigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Shield, CheckCircle2 } from 'lucide-react';

function SetNewPasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');
  const { updatePassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (newPassword.length < 8) {
      setValidationError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await updatePassword(newPassword);
    setIsSubmitting(false);

    if (!error) {
      // updatePassword clears recovery flag, redirect happens via auth state
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-primary text-sm">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <span>Identity verified. Set your new password below.</span>
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-password">New Password</Label>
        <Input
          id="new-password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          disabled={isSubmitting}
          placeholder="Minimum 8 characters"
          minLength={8}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isSubmitting}
          placeholder="Re-enter your new password"
        />
      </div>
      {validationError && (
        <p className="text-sm text-destructive">{validationError}</p>
      )}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Update Password
      </Button>
    </form>
  );
}

export default function AdminAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [searchParams] = useSearchParams();
  const { user, loading, isVerifyingAccess, userRole, isPasswordRecovery, signIn, resetPassword, signInWithGoogle } = useAuth();

  const isRecoveryMode = isPasswordRecovery || searchParams.get('mode') === 'recovery';

  // Redirect if authenticated and NOT in recovery mode
  if (!loading && !isVerifyingAccess && user && !isRecoveryMode) {
    if (userRole === 'staff') {
      return <Navigate to="/staff" replace />;
    }
    return <Navigate to="/admin" replace />;
  }

  if (loading || isVerifyingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/40">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          {isVerifyingAccess && (
            <p className="text-sm text-muted-foreground animate-pulse">Verifying access...</p>
          )}
        </div>
      </div>
    );
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await signIn(email, password);
    setIsSubmitting(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await resetPassword(resetEmail);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            Soul Train's Eatery
          </CardTitle>
          <CardDescription>
            {isRecoveryMode ? 'Set Your New Password' : 'Staff & Admin Portal'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isRecoveryMode ? (
            <SetNewPasswordForm />
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="reset">Reset Password</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Sign In
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={signInWithGoogle}
                  disabled={isSubmitting}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Sign in with Google
                </Button>

                <div className="text-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    Forgot your password?{' '}
                    <button 
                      onClick={() => setActiveTab('reset')}
                      className="text-primary hover:underline"
                      type="button"
                    >
                      Reset it here
                    </button>
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="reset">
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      disabled={isSubmitting}
                      placeholder="Enter your email address"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Send Reset Email
                  </Button>
                </form>
                <div className="text-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    Remember your password?{' '}
                    <button 
                      onClick={() => setActiveTab('signin')}
                      className="text-primary hover:underline"
                      type="button"
                    >
                      Sign in here
                    </button>
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 text-center space-y-3 max-w-md w-full">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3 w-3" />
          <span>256-bit SSL encrypted</span>
          <span>•</span>
          <span>Your data is secure</span>
        </div>
        <div className="text-xs text-muted-foreground">
          <p>Need help? Contact Support</p>
          <p className="mt-1">
            <a href="tel:+18439700265" className="hover:text-primary transition-colors">(843) 970-0265</a>
            <span className="mx-2">•</span>
            <a href="mailto:soultrainseatery@gmail.com" className="hover:text-primary transition-colors">
              soultrainseatery@gmail.com
            </a>
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <span className="mx-2">|</span>
          <Link to="/terms-conditions" className="hover:text-primary transition-colors">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
}
