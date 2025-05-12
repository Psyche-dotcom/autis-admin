import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Category, ISymbol } from "@/interface";

interface SymbolGeneratorProps {
  categories: Category[];
  onGenerateSymbol: (symbol: ISymbol) => void;
}

export function SymbolGenerator({
  categories,
  onGenerateSymbol,
}: SymbolGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [symbolName, setSymbolName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSVG, setGeneratedSVG] = useState("");

  // This would normally call an AI service
  // For demo purposes, we'll simulate generation with predefined SVGs
  const mockGenerateSVG = async (
    promptText: string,
    category: string
  ): Promise<string> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simple keyword matching for demo purposes
    const promptLower = promptText.toLowerCase();
    const categoryObj = categories.find((c) => c.id === category);
    const categoryName = categoryObj?.name.toLowerCase() || "";

    if (
      promptLower.includes("arrow") ||
      promptLower.includes("direction") ||
      categoryName.includes("arrow")
    ) {
      return `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>`;
    } else if (
      promptLower.includes("moon") ||
      promptLower.includes("night") ||
      categoryName.includes("weather")
    ) {
      return `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    } else if (
      promptLower.includes("sun") ||
      promptLower.includes("day") ||
      categoryName.includes("weather")
    ) {
      return `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
    } else if (
      promptLower.includes("menu") ||
      promptLower.includes("hamburger") ||
      categoryName.includes("ui")
    ) {
      return `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
    } else {
      // Default shape
      return `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>`;
    }
  };

  const handleGenerate = async () => {
    if (!prompt) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a description for the symbol",
      });
      return;
    }

    if (!categoryId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a category for the symbol",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // In a real app, this would call an AI service API with both prompt and category
      const svg = await mockGenerateSVG(prompt, categoryId);
      setGeneratedSVG(svg);

      // Auto-generate a name if not provided
      if (!symbolName) {
        const words = prompt.split(" ");
        const capitalizedWords = words.map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1)
        );
        setSymbolName(capitalizedWords.join(" "));
      }

      toast({
        title: "Symbol Generated",
        description:
          "Your symbol has been created. Click Save to add it to your library.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "There was an error generating your symbol",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!symbolName || !generatedSVG || !categoryId) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    const newSymbol: ISymbol = {
      id: Math.random().toString(36).substring(7),
      name: symbolName,
      svg: generatedSVG,
      categoryId,
      dateCreated: new Date().toISOString().split("T")[0],
    };

    onGenerateSymbol(newSymbol);

    toast({
      title: "Symbol Saved",
      description: `${symbolName} has been added to your library`,
    });

    // Reset form
    setPrompt("");
    setSymbolName("");
    setGeneratedSVG("");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">
            Describe the symbol you want to generate
          </Label>
          <Textarea
            id="prompt"
            placeholder="E.g., A right-facing arrow with a curved shaft"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="h-24"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="symbol-category">Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt || !categoryId}
        >
          {isGenerating ? "Generating..." : "Generate Symbol"}
        </Button>
      </div>

      {generatedSVG && (
        <div className="border rounded-md p-6 space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-medium">Generated Symbol</h3>
            <div className="mt-4 p-4 flex justify-center items-center">
              <div
                className="w-24 h-24 bg-muted rounded flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: generatedSVG }}
              />
            </div>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol-name">Symbol Name</Label>
              <Input
                id="symbol-name"
                value={symbolName}
                onChange={(e) => setSymbolName(e.target.value)}
                placeholder="Enter a name for this symbol"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="svg-code">SVG Code</Label>
              <Textarea
                id="svg-code"
                value={generatedSVG}
                readOnly
                className="font-mono text-xs h-24"
              />
            </div>

            <Button onClick={handleSave} className="mt-2">
              Save to Library
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
