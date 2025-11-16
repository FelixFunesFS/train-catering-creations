/**
 * Development Testing Panel
 * UI for generating and managing test quote data
 * Only accessible in development mode or to admins
 */

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  generateTestQuotes,
  clearTestQuotes,
  getTestQuoteCount,
  TestDataOptions,
  GenerationResult,
} from "@/utils/testDataGenerator";
import { Loader2, Database, Trash2, CheckCircle2, AlertCircle } from "lucide-react";

export default function DevTestingPanel() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [testQuoteCount, setTestQuoteCount] = useState(0);
  const [lastResult, setLastResult] = useState<GenerationResult | null>(null);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(["mixed"]);
  const [quickCount, setQuickCount] = useState(10);

  useEffect(() => {
    loadTestQuoteCount();
  }, []);

  const loadTestQuoteCount = async () => {
    const count = await getTestQuoteCount();
    setTestQuoteCount(count);
  };

  const handleGenerateQuotes = async (count: number) => {
    setIsGenerating(true);
    setLastResult(null);

    try {
      const options: TestDataOptions = {
        count,
        scenarios: selectedScenarios as ("corporate" | "wedding" | "military" | "mixed")[],
        dateRange: { startDays: 7, endDays: 90 },
        statusDistribution: {
          pending: 40,
          under_review: 20,
          quoted: 20,
          approved: 15,
          paid: 5,
        },
        skipEmails: true,
      };

      const result = await generateTestQuotes(options);
      setLastResult(result);

      if (result.success > 0) {
        toast({
          title: "Test Data Generated",
          description: `Successfully created ${result.success} test quotes`,
        });
        await loadTestQuoteCount();
      }

      if (result.failed > 0) {
        toast({
          title: "Generation Completed with Errors",
          description: `${result.failed} quotes failed to generate`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearTestData = async () => {
    if (!confirm("Are you sure you want to delete ALL test quotes? This cannot be undone.")) {
      return;
    }

    setIsClearing(true);

    try {
      const result = await clearTestQuotes();

      if (result.error) {
        toast({
          title: "Clear Failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Test Data Cleared",
          description: `Deleted ${result.deleted} test quotes`,
        });
        await loadTestQuoteCount();
        setLastResult(null);
      }
    } catch (error) {
      toast({
        title: "Clear Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const toggleScenario = (scenario: string) => {
    if (scenario === "mixed") {
      setSelectedScenarios(["mixed"]);
    } else {
      setSelectedScenarios((prev) => {
        const filtered = prev.filter((s) => s !== "mixed");
        if (filtered.includes(scenario)) {
          const newScenarios = filtered.filter((s) => s !== scenario);
          return newScenarios.length === 0 ? ["mixed"] : newScenarios;
        } else {
          return [...filtered, scenario];
        }
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Development Testing Panel</h1>
        <p className="text-muted-foreground">
          Generate and manage test quote data for dashboard testing
        </p>
      </div>

      {/* Current Test Data Count */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Current Test Quotes</h3>
            <p className="text-sm text-muted-foreground">
              Quotes with email ending in @soultrain-test.com
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{testQuoteCount}</div>
            <Button
              onClick={loadTestQuoteCount}
              variant="ghost"
              size="sm"
              className="mt-2"
            >
              Refresh Count
            </Button>
          </div>
        </div>
      </Card>

      {/* Scenario Selection */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Select Scenarios</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="mixed"
              checked={selectedScenarios.includes("mixed")}
              onCheckedChange={() => toggleScenario("mixed")}
            />
            <label htmlFor="mixed" className="text-sm font-medium cursor-pointer">
              Mixed (All Scenarios)
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="corporate"
              checked={selectedScenarios.includes("corporate")}
              onCheckedChange={() => toggleScenario("corporate")}
              disabled={selectedScenarios.includes("mixed")}
            />
            <label htmlFor="corporate" className="text-sm font-medium cursor-pointer">
              Corporate Events Only
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="wedding"
              checked={selectedScenarios.includes("wedding")}
              onCheckedChange={() => toggleScenario("wedding")}
              disabled={selectedScenarios.includes("mixed")}
            />
            <label htmlFor="wedding" className="text-sm font-medium cursor-pointer">
              Wedding Events Only
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="military"
              checked={selectedScenarios.includes("military")}
              onCheckedChange={() => toggleScenario("military")}
              disabled={selectedScenarios.includes("mixed")}
            />
            <label htmlFor="military" className="text-sm font-medium cursor-pointer">
              Military Functions Only
            </label>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Quick Generate</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[10, 25, 50, 100].map((count) => (
            <Button
              key={count}
              onClick={() => handleGenerateQuotes(count)}
              disabled={isGenerating}
              variant="outline"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              Generate {count}
            </Button>
          ))}
        </div>
      </Card>

      {/* Results Display */}
      {lastResult && (
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Last Generation Results</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Success:</span>
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {lastResult.success}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Failed:</span>
              <Badge variant={lastResult.failed > 0 ? "destructive" : "secondary"}>
                {lastResult.failed}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Corporate:</span>
              <Badge variant="outline">{lastResult.summary.corporate}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Wedding:</span>
              <Badge variant="outline">{lastResult.summary.wedding}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Military:</span>
              <Badge variant="outline">{lastResult.summary.military}</Badge>
            </div>
            {lastResult.errors.length > 0 && (
              <div className="mt-4 p-3 bg-destructive/10 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-semibold">Errors:</span>
                </div>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  {lastResult.errors.slice(0, 5).map((error, i) => (
                    <li key={i}>• {error}</li>
                  ))}
                  {lastResult.errors.length > 5 && (
                    <li>• ... and {lastResult.errors.length - 5} more</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Danger Zone */}
      <Card className="p-6 border-destructive/50">
        <h3 className="text-lg font-semibold mb-2 text-destructive">Danger Zone</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Delete all test quotes from the database. This action cannot be undone.
        </p>
        <Button
          onClick={handleClearTestData}
          disabled={isClearing || testQuoteCount === 0}
          variant="destructive"
        >
          {isClearing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4 mr-2" />
          )}
          Clear All Test Data
        </Button>
      </Card>
    </div>
  );
}
