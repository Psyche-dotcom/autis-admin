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

import { Category, ISymbol } from "@/interface";

// NOTE: This component depends on the `xlsx` package for reading Excel files.
// Install with: npm install xlsx --save

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

  // Bulk upload states
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [mappedFiles, setMappedFiles] = useState<Record<number, File | null>>(
    {}
  );
  const [allPickedFiles, setAllPickedFiles] = useState<File[]>([]);
  const [excelRows, setExcelRows] = useState<any[]>([]);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 });
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);

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

  // -------------------- Bulk Excel Upload Helpers --------------------
  // Improved file matching logic

  const normalize = (s: string) => {
    return String(s || "")
      .trim()
      .replace(/^"|"$/g, "") // remove surrounding quotes
      .replace(/%20/g, " ")
      .toLowerCase();
  };

  function extractBaseName(path: string) {
    if (!path) return "";

    // Handle URL-encoded paths and various separators
    const decodedPath = decodeURIComponent(path);
    const normalizedPath = decodedPath.replace(/\\/g, "/");
    const parts = normalizedPath.split("/");
    let filename = parts[parts.length - 1];

    // Clean up the filename - remove any query parameters or fragments
    filename = filename.split("?")[0].split("#")[0];

    return filename.trim();
  }

  async function onExcelPicked(file: File | null) {
    setExcelFile(file);
    setExcelRows([]);
    setMappedFiles({});

    if (!file) return;

    const XLSX = await import("xlsx");
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) return;
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
      // Ensure rows are plain objects
      setExcelRows(json as any[]);

      // debug log
      console.log("[BulkUpload] Excel loaded. Rows:", json);
    };
    reader.readAsArrayBuffer(file);
  }

  const tryAutoMap = (files: File[], rows: any[]) => {
    console.log(
      "[BulkUpload] tryAutoMap called. files:",
      files.map((f) => f.name)
    );
    const map: Record<number, File | null> = {};

    rows.forEach((row, idx) => {
      // Try to get the most likely file path column (case-insensitive, flexible)
      const rawPath =
        row.filePath ||
        row.file ||
        row.FilePath ||
        row.File ||
        row.path ||
        row.Path ||
        row.filename ||
        row.fileName ||
        "";

      // Extract just the filename from the path (handle Windows, URL-encoded, and mixed separators)
      let pathVal = String(rawPath || "");
      // Remove surrounding quotes if present
      if (pathVal.startsWith('"') && pathVal.endsWith('"')) {
        pathVal = pathVal.slice(1, -1);
      }
      // Decode URI components (for URL-encoded paths)
      try {
        pathVal = decodeURIComponent(pathVal);
      } catch {}
      // Replace backslashes with slashes for Windows paths
      pathVal = pathVal.replace(/\\/g, "/");
      // Remove any query string or fragment
      pathVal = pathVal.split("?")[0].split("#")[0];
      // Get the last segment as the filename
      const basename = pathVal.split("/").pop()?.trim() || "";

      console.log(`[BulkUpload] Row ${idx + 1} looking for: "${basename}"`);

      let found: File | null = null;

      // 1) Exact match with filename (case-insensitive)
      found =
        files.find((f) => f.name.toLowerCase() === basename.toLowerCase()) ||
        null;

      // 2) Match without file extension
      if (!found && basename) {
        const basenameNoExt = basename.replace(/\.[^/.]+$/, "").toLowerCase();
        found =
          files.find(
            (f) =>
              f.name.toLowerCase().replace(/\.[^/.]+$/, "") === basenameNoExt
          ) || null;
      }

      // 3) Partial match - filename contains the basename or vice versa
      if (!found && basename) {
        const basenameLower = basename.toLowerCase();
        found =
          files.find((f) => {
            const fileNameLower = f.name.toLowerCase();
            return (
              fileNameLower.includes(basenameLower) ||
              basenameLower.includes(fileNameLower.replace(/\.[^/.]+$/, ""))
            );
          }) || null;
      }

      // 4) Match by symbol name if no file path is available
      if (!found && (!rawPath || rawPath.trim() === "")) {
        const symbolName = (row.name || row.Name || "").toLowerCase();
        if (symbolName) {
          found =
            files.find(
              (f) =>
                f.name.toLowerCase().includes(symbolName) ||
                symbolName.includes(
                  f.name.toLowerCase().replace(/\.[^/.]+$/, "")
                )
            ) || null;
        }
      }

      if (found) {
        console.log(`[BulkUpload] Row ${idx + 1} matched file:`, found.name);
      } else {
        console.log(
          `[BulkUpload] Row ${idx + 1} NOT matched. Available files:`,
          files.map((f) => f.name)
        );
      }

      map[idx] = found || null;
    });

    console.log(
      "[BulkUpload] auto-map result:",
      Object.keys(map).map((k) => ({
        row: Number(k) + 1,
        file: map[Number(k)] ? map[Number(k)]!.name : null,
      }))
    );
    return map;
  };

  const onPickAllFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    setAllPickedFiles(arr);

    console.log(
      "[BulkUpload] Files selected:",
      arr.map((f) => f.name)
    );

    const map = tryAutoMap(arr, excelRows);
    setMappedFiles(map);
  };

  const handleManualMap = (idx: number, file: File | null) => {
    console.log(
      `[BulkUpload] Manual map row ${idx + 1} ->`,
      file ? file.name : null
    );
    setMappedFiles((prev) => ({ ...prev, [idx]: file }));
  };

  async function readFileToSvgString(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (file.type === "image/svg+xml") {
          resolve(result);
        } else {
          // for png/jpg return an <img/> wrapper as the existing code expects
          resolve(
            `<img src="${result}" alt="${file.name}" width="24" height="24" />`
          );
        }
      };
      reader.onerror = reject;
      if (file.type === "image/svg+xml") reader.readAsText(file);
      else reader.readAsDataURL(file);
    });
  }

  const startBulkUpload = async () => {
    setBulkErrors([]);
    if (!excelRows.length) {
      setBulkErrors(["Please upload an Excel file with symbol rows."]);
      return;
    }

    // debug: print current state
    console.log("[BulkUpload] Starting. excelRows:", excelRows);
    console.log(
      "[BulkUpload] All picked files:",
      allPickedFiles.map((f) => f.name)
    );
    console.log(
      "[BulkUpload] Current mappedFiles:",
      Object.keys(mappedFiles).map((k) => ({
        row: Number(k) + 1,
        file: mappedFiles[Number(k)] ? mappedFiles[Number(k)]!.name : null,
      }))
    );

    const total = excelRows.length;
    setBulkProgress({ done: 0, total });
    setBulkUploading(true);

    const errors: string[] = [];
    let done = 0;

    for (let i = 0; i < excelRows.length; i++) {
      const row = excelRows[i];
      let file = mappedFiles[i] || null;

      if (!file) {
        // try auto map again using allPickedFiles
        const map = tryAutoMap(allPickedFiles, [row]);
        file = map[0] || null;
        console.log(
          `[BulkUpload] Re-auto-map for row ${i + 1} found:`,
          file ? file.name : null
        );
      }

      if (!file) {
        errors.push(
          `Row ${i + 1} (${
            row.name || "-"
          }): file not found among selected files.`
        );
        setBulkProgress({ done: ++done, total });
        continue;
      }

      try {
        const svgString = await readFileToSvgString(file);
        const symbol: ISymbol = {
          id: Math.random().toString(36).substring(7),
          name: row.name || row.Name || row.title || `Symbol-${i + 1}`,
          svg: svgString,
          categoryId:
            (row.category &&
              categories.find(
                (c) =>
                  c.name.toLowerCase() === String(row.category).toLowerCase()
              )?.id) ||
            (row.categoryId &&
              categories.find((c) => c.id === String(row.categoryId))?.id) ||
            categories[0]?.id ||
            "",
          dateCreated: new Date().toISOString().split("T")[0],
          file,
        };

        console.log(
          `[BulkUpload] Uploading row ${i + 1} -> file: ${
            file.name
          }, symbol name: ${symbol.name}`
        );

        // Use existing onAdd handler so caller can use API
        onAdd(symbol);
      } catch (e: any) {
        errors.push(
          `Row ${i + 1} (${row.name || "-"}): failed to read file - ${
            e?.message || e
          }`
        );
      }

      setBulkProgress({ done: ++done, total });
    }

    setBulkErrors(errors);
    setBulkUploading(false);

    console.log("[BulkUpload] Finished. errors:", errors);
  };

  // -------------------- UI --------------------
  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Bulk Upload (Excel)
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Bulk Upload Symbols via Excel</DialogTitle>
              <DialogDescription>
                Upload an Excel file containing symbol rows (name and file
                path). Then select the actual symbol files (.svg/.png) so the
                browser can read them. Browsers cannot access arbitrary file
                paths, so you must also select the files.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div>
                <Label>Step 1 — Pick Excel file (xlsx)</Label>
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => onExcelPicked(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Excel must contain at least a column for the symbol name (e.g.
                  "name") and a column for file path (e.g. "filePath"). Column
                  names are case-insensitive. The file path column is only used
                  to match filenames; you will still need to select the actual
                  files in step 2.
                </p>
              </div>

              <div>
                <Label>
                  Step 2 — Select all symbol files referenced in the Excel
                </Label>
                <Input
                  type="file"
                  accept=".svg,.png"
                  multiple
                  onChange={(e) => onPickAllFiles(e.target.files)}
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={() => {
                      console.log("[BulkUpload] Auto-match clicked");
                      setMappedFiles(tryAutoMap(allPickedFiles, excelRows));
                    }}
                    disabled={!allPickedFiles.length || !excelRows.length}
                  >
                    Auto-match
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAllPickedFiles([]);
                      setMappedFiles({});
                      const fileInput = document.querySelector(
                        'input[type=file][accept=".svg,.png"][multiple]'
                      ) as HTMLInputElement | null;
                      if (fileInput) fileInput.value = "";
                    }}
                  >
                    Reset files
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      console.log("[BulkUpload] Debug dump", {
                        excelRows,
                        allPickedFiles: allPickedFiles.map((f) => f.name),
                        mappedFiles,
                      })
                    }
                  >
                    Console dump
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Select all .svg/.png files referenced by the Excel. Matching
                  is done by filename (basename). If auto-matching fails you can
                  manually pick a file for each row below.
                </p>
              </div>

              <div>
                <Label>Preview mapping (manual override available)</Label>
                <div className="max-h-64 overflow-auto border rounded p-2">
                  {excelRows.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No rows found yet
                    </div>
                  ) : (
                    excelRows.map((row, idx) => {
                      const pathVal = String(
                        row.filePath ||
                          row.file ||
                          row.FilePath ||
                          row.File ||
                          row.path ||
                          row.Path ||
                          row.filename ||
                          row.fileName ||
                          ""
                      );
                      const basename = extractBaseName(pathVal);
                      const mapped = mappedFiles[idx];

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-4 p-2 even:bg-muted/30"
                        >
                          <div className="flex-1">
                            <div className="font-medium">
                              {row.name || row.Name || `Row ${idx + 1}`}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Excel path: {pathVal || "(no path specified)"}
                            </div>
                            <div className="text-xs">
                              Looking for: "{basename || "(no filename)"}"
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="text-sm">
                              {mapped ? (
                                <div className="flex items-center gap-2 text-green-600">
                                  <span className="truncate max-w-[200px]">
                                    {mapped.name}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-destructive">
                                  File not selected
                                </span>
                              )}
                            </div>

                            {/* Manual file selection */}
                            <label className="cursor-pointer px-2 py-1 border rounded text-xs bg-blue-50 hover:bg-blue-100">
                              Choose File
                              <input
                                type="file"
                                accept=".svg,.png"
                                className="hidden"
                                onChange={(e) =>
                                  handleManualMap(
                                    idx,
                                    e.target.files?.[0] || null
                                  )
                                }
                              />
                            </label>

                            {/* Dropdown to pick from uploaded files */}
                            {allPickedFiles.length > 0 && (
                              <select
                                className="text-xs p-1 border rounded"
                                value={
                                  mapped
                                    ? allPickedFiles
                                        .findIndex(
                                          (f) => f.name === mapped.name
                                        )
                                        ?.toString() || "-1"
                                    : "-1"
                                }
                                onChange={(e) => {
                                  const v = Number(e.target.value);
                                  const f =
                                    Number.isFinite(v) && v >= 0
                                      ? allPickedFiles[v]
                                      : null;
                                  handleManualMap(idx, f);
                                }}
                              >
                                <option value={"-1"}>— pick file —</option>
                                {allPickedFiles.map((f, i) => (
                                  <option key={i} value={i}>
                                    {f.name}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 items-center">
                <div>
                  <Button
                    onClick={startBulkUpload}
                    disabled={bulkUploading || excelRows.length === 0}
                  >
                    {bulkUploading
                      ? `Uploading (${bulkProgress.done}/${bulkProgress.total})`
                      : "Start Bulk Upload"}
                  </Button>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  {bulkErrors.length > 0 && (
                    <div>
                      <div className="font-medium text-destructive">Errors</div>
                      <ul className="list-disc ml-4 text-xs">
                        {bulkErrors.map((e, i) => (
                          <li key={i}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsBulkDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                  <div className="col-span-3 border rounded p-4 flex justify-center items-center h-24 overflow-hidden">
                    {selectedFile?.type === "image/svg+xml" ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: previewSrc }}
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      />
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
