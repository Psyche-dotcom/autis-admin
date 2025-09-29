import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import HttpService from "@/service/httpService";
import { routes } from "@/service/api-routes";
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
      const res = await HttpService.getData(
        routes.generateAiSymbol(prompt, categoryId)
      );

      // Auto-generate a name if not provided
      if (res != null) {
      }

      toast({
        title: "Symbol Generated",
        description:
          "Your symbol has been generated. when it is ready it will be saved to the category.",
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
