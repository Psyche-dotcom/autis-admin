"use client";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SymbolList } from "./SymbolList";
import { SymbolCategoryManagement } from "./SymbolCategoryManagement";
import { SymbolGenerator } from "./SymbolGenerator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search } from "lucide-react";
import HttpService from "@/service/httpService";
import { routes } from "@/service/api-routes";
import { Category, ISymbol } from "@/interface";
import { mapApiToCatCount, mapApiToCatSymbol } from "@/lib/utils";

export function SymbolManagement() {
  const [symbols, setSymbols] = useState<ISymbol[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const fetchCat = async () => {
    const response = await HttpService.getData(routes.catSymbolUrl());

    //@ts-ignore
    const converted = response?.map(mapApiToCatCount) || [];
    setCategories(converted);
  };
  const fetchCatSymbol = async (catid: string | undefined) => {
    const response = await HttpService.postData(
      {
        catid: catid,
      },
      routes.catinSymbolUrl()
    );

    //@ts-ignore
    const converted = response?.map(mapApiToCatSymbol) || [];

    setSymbols(converted);
  };
  const handleAddSymbol = async (symbol: ISymbol) => {
    const response = await HttpService.uploadProfile(
      //@ts-ignore
      symbol.file,
      routes.UploadsymbolUrl(symbol.categoryId, symbol.name)
    );

    await fetchCat();
    await fetchCatSymbol("");
    toast({
      title: "Symbol Created",
      description: `${symbol.name} has been added to the library`,
    });
  };

  const handleUpdateSymbol = (updatedSymbol: ISymbol) => {
    setSymbols(
      symbols.map((symbol) =>
        symbol.id === updatedSymbol.id ? updatedSymbol : symbol
      )
    );

    toast({
      title: "Symbol Updated",
      description: `${updatedSymbol.name} has been updated`,
    });
  };

  const handleDeleteSymbol = async (id: string) => {
    const response = await HttpService.deleteData(routes.DeletesymbolUrl(id));
    await fetchCat();
    await fetchCatSymbol("");
    toast({
      title: "Symbol Deleted",
      description: "The symbol has been removed from the library",
    });
  };

  const handleAddCategory = async (category: Category) => {
    const response = await HttpService.postData(
      {
        categoryName: category.name,
        categoryType: "Admin",
      },
      routes.AddCatUrl()
    );
    fetchCat();
    toast({
      title: "Category Created",
      description: `${category.name} category has been created`,
    });
  };

  const handleUpdateCategory = (updatedCategory: Category) => {
    setCategories(
      categories.map((category) =>
        category.id === updatedCategory.id ? updatedCategory : category
      )
    );

    toast({
      title: "Category Updated",
      description: `${updatedCategory.name} category has been updated`,
    });
  };

  const handleDeleteCategory: (id: string) => Promise<void> = async (
    id: string
  ) => {
    const response = await HttpService.deleteData(routes.DeleteCatUrl(id));
    await fetchCat();

    toast({
      title: "Category Deleted",
      description: "The category has been removed",
    });
  };

  // Filter symbols based on search and category
  const filteredSymbols = symbols.filter((symbol) => {
    const matchesSearch = symbol.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategoryId || symbol.categoryId === selectedCategoryId;
    return matchesSearch && matchesCategory;
  });
  useEffect(() => {
    fetchCat();
    fetchCatSymbol("");
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Symbol Management</h1>
        <p className="text-muted-foreground mt-1">
          Create, edit and organize your symbol library
        </p>
      </div>

      <Tabs defaultValue="list">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Symbol Library</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="generator">Symbol Generator</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <CardTitle>Symbol Library</CardTitle>
                <div className="flex items-center bg-muted rounded-md">
                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  <Input
                    placeholder="Search symbols..."
                    className="border-0 bg-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <CardDescription>
                {selectedCategoryId
                  ? `Showing symbols in ${
                      categories.find((c) => c.id === selectedCategoryId)?.name
                    } category`
                  : "Showing all symbols"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap gap-2">
                <Button
                  variant={!selectedCategoryId ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategoryId(null)}
                >
                  All
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={
                      selectedCategoryId === category.id
                        ? "secondary"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedCategoryId(category.id)}
                  >
                    {category.name} ({category.symbolCount})
                  </Button>
                ))}
              </div>
              <SymbolList
                symbols={filteredSymbols}
                categories={categories}
                onUpdate={handleUpdateSymbol}
                onDelete={handleDeleteSymbol}
                onAdd={handleAddSymbol}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Management</CardTitle>
              <CardDescription>
                Create and manage categories for organizing your symbols
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SymbolCategoryManagement
                categories={categories}
                onAdd={handleAddCategory}
                onUpdate={handleUpdateCategory}
                onDelete={handleDeleteCategory}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generator" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Symbol Generator</CardTitle>
              <CardDescription>
                Generate new symbols using AI and add them to your library
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SymbolGenerator
                categories={categories}
                onGenerateSymbol={handleAddSymbol}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
