import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Plus, Trash2, Upload } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Category, ISymbol } from "@/interface";

interface SymbolListProps {
  symbols: ISymbol[];
  categories: Category[];
  onUpdate: (symbol: ISymbol) => void;
  onDelete: (id: string) => void;
  onAdd: (symbol: ISymbol) => void;
}

export function SymbolList({
  symbols,
  categories,
  onUpdate,
  onDelete,
  onAdd,
}: SymbolListProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentSymbol, setCurrentSymbol] = useState<ISymbol | null>(null);
  const [newSymbol, setNewSymbol] = useState<Partial<ISymbol>>({
    name: "",
    svg: "",
    categoryId: categories[0]?.name || "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string>("");
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);
  const [editPreviewSrc, setEditPreviewSrc] = useState<string>("");

  const handleEdit = (symbol: ISymbol) => {
    setCurrentSymbol(symbol);
    setEditPreviewSrc(""); // Clear any previous preview
    setEditSelectedFile(null);
    setIsEditDialogOpen(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // Read the file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewSrc(result);

      // For SVG files, we can use the content directly
      if (file.type === "image/svg+xml") {
        setNewSymbol({ ...newSymbol, svg: result, file: file });
      }
      // For PNG files, we'll use the data URL
      else if (file.type === "image/png") {
        setNewSymbol({
          ...newSymbol,
          svg: result,
          file: file,
        });
      }
    };

    if (file.type === "image/svg+xml") {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  const handleEditFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentSymbol) return;

    const file = event.target.files?.[0];
    if (!file) return;

    setEditSelectedFile(file);

    // Read the file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setEditPreviewSrc(result);

      // For SVG files, we can use the content directly
      if (file.type === "image/svg+xml") {
        setCurrentSymbol({ ...currentSymbol, svg: result });
      }
      // For PNG files, we'll use the data URL
      else if (file.type === "image/png") {
        setCurrentSymbol({
          ...currentSymbol,
          svg: `<img src="${result}" alt="${file.name}" width="24" height="24" />`,
        });
      }
    };

    if (file.type === "image/svg+xml") {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  const handleAddSubmit = () => {
    if (!newSymbol.name || !newSymbol.svg || !newSymbol.categoryId) {
      return;
    }

    const symbol: ISymbol = {
      id: Math.random().toString(36).substring(7),
      name: newSymbol.name,
      svg: newSymbol.svg,
      categoryId: newSymbol.categoryId,
      dateCreated: new Date().toISOString().split("T")[0],
      file: newSymbol.file,
    };

    onAdd(symbol);
    setNewSymbol({
      name: "",
      svg: "",
      categoryId: categories[0]?.id || "",
    });
    setSelectedFile(null);
    setPreviewSrc("");
    setIsAddDialogOpen(false);
  };

  const handleEditSubmit = () => {
    if (
      !currentSymbol ||
      !currentSymbol.name ||
      !currentSymbol.svg ||
      !currentSymbol.categoryId
    ) {
      return;
    }

    onUpdate(currentSymbol);
    setEditSelectedFile(null);
    setEditPreviewSrc("");
    setIsEditDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Symbol
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Symbol</DialogTitle>
              <DialogDescription>
                Create a new symbol for your library
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newSymbol.name}
                  onChange={(e) =>
                    setNewSymbol({ ...newSymbol, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select
                  value={newSymbol.categoryId}
                  onValueChange={(value) =>
                    setNewSymbol({ ...newSymbol, categoryId: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="symbolFile" className="text-right pt-2">
                  Symbol File
                </Label>
                <div className="col-span-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      id="symbolFile"
                      type="file"
                      accept=".svg,.png"
                      onChange={handleFileChange}
                      className="flex-1"
                    />
                    <Button variant="outline" size="icon" type="button">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload an SVG or PNG file for your symbol.
                  </p>
                </div>
              </div>
              {previewSrc && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right">Preview</span>
                  <div className="col-span-3 border rounded p-4 flex justify-center items-center h-24">
                    {selectedFile?.type === "image/svg+xml" ? (
                      <div dangerouslySetInnerHTML={{ __html: previewSrc }} />
                    ) : (
                      <img
                        src={previewSrc}
                        alt="Symbol preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddSubmit}
                disabled={!newSymbol.name || !selectedFile}
              >
                Add Symbol
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Symbol Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {symbols.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No symbols found
                </TableCell>
              </TableRow>
            ) : (
              symbols.map((symbol) => (
                <TableRow key={symbol.id}>
                  <TableCell>
                    <div className="w-10 h-10 flex items-center justify-center bg-muted rounded overflow-hidden">
                      <img
                        src={symbol.svg}
                        alt="Symbol"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </TableCell>
                  <TableCell>{symbol.name}</TableCell>
                  <TableCell>
                    {categories.find((c) => c.id === symbol.categoryId)?.name ||
                      "Uncategorized"}
                  </TableCell>
                  <TableCell>{symbol.dateCreated}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(symbol)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Symbol</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {symbol.name}? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(symbol.id)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      {currentSymbol && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Symbol</DialogTitle>
              <DialogDescription>
                Update the details for this symbol
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={currentSymbol.name}
                  onChange={(e) =>
                    setCurrentSymbol({ ...currentSymbol, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">
                  Category
                </Label>
                <Select
                  value={currentSymbol.categoryId}
                  onValueChange={(value) =>
                    setCurrentSymbol({ ...currentSymbol, categoryId: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
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
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-symbolFile" className="text-right pt-2">
                  Symbol File
                </Label>
                <div className="col-span-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      id="edit-symbolFile"
                      type="file"
                      accept=".svg,.png"
                      onChange={handleEditFileChange}
                      className="flex-1"
                    />
                    <Button variant="outline" size="icon" type="button">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload a new SVG or PNG file to replace the current symbol.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-right">Current</span>
                <div
                  className="col-span-3 border rounded p-4 flex justify-center items-center h-24"
                  dangerouslySetInnerHTML={{
                    __html: editPreviewSrc || currentSymbol.svg,
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleEditSubmit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
