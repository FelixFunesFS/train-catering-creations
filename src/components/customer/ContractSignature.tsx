import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useContractManagement } from '@/hooks/useContractManagement';
import { FileText, Loader2, CheckCircle2 } from 'lucide-react';

interface ContractSignatureProps {
  invoiceId: string;
  contractId?: string;
  contractHtml?: string;
  onSigned?: () => void;
}

export function ContractSignature({ invoiceId, contractId, contractHtml, onSigned }: ContractSignatureProps) {
  const [signedName, setSignedName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const { signContract, loading } = useContractManagement(invoiceId);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    setSignature(canvas.toDataURL());
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature('');
  };

  const handleSign = async () => {
    if (!contractId) return;

    await signContract(contractId, signedName);
    if (onSigned) onSigned();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Service Agreement
        </CardTitle>
        <CardDescription>
          Please review and sign the contract below
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contract Preview */}
        {contractHtml && (
          <div className="border rounded-lg p-6 max-h-96 overflow-y-auto bg-muted/50">
            <div dangerouslySetInnerHTML={{ __html: contractHtml }} />
          </div>
        )}

        {/* Signature Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signedName">Full Legal Name</Label>
            <Input
              id="signedName"
              placeholder="Enter your full name"
              value={signedName}
              onChange={(e) => setSignedName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Digital Signature</Label>
            <div className="border-2 border-dashed rounded-lg p-2">
              <canvas
                ref={canvasRef}
                width={500}
                height={150}
                className="w-full bg-white rounded cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>
            <Button variant="outline" size="sm" onClick={clearSignature}>
              Clear Signature
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="agree"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
            />
            <Label htmlFor="agree" className="text-sm cursor-pointer">
              I have read and agree to the terms and conditions outlined in this service agreement
            </Label>
          </div>

          <Button
            onClick={handleSign}
            disabled={!signedName || !signature || !agreed || loading}
            className="w-full"
            size="lg"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!loading && <CheckCircle2 className="mr-2 h-4 w-4" />}
            Sign Contract
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
