"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/dialog";
import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";

interface ImportExcelDialogProps {
  studySetId: number;
  onSuccess?: () => void;
}

export default function ImportExcelDialog({ studySetId, onSuccess }: ImportExcelDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = api.useUtils();

  const importMutation = api.flashcard.importExcel.useMutation({
    onSuccess: (data) => {
      toast.success(`Đã import ${data.length} flashcard thành công!`);
      void utils.studySet.invalidate();
      setOpen(false);
      setFile(null);
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(err.message ?? "Import thất bại");
    },
  });

  const templateMutation = api.flashcard.downloadTemplate.useMutation({
    onSuccess: (data) => {
      // Trigger download from base64
      const link = document.createElement("a");
      link.href = `data:${data.contentType};base64,${data.base64}`;
      link.download = data.filename || "flashcard_template.xlsx";
      link.click();
    },
    onError: () => toast.error("Không thể tải template"),
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.name.endsWith(".xlsx") && !selected.name.endsWith(".xls")) {
      toast.error("Vui lòng chọn file Excel (.xlsx hoặc .xls)");
      return;
    }

    setFile(selected);
    setPreview(selected.name);
  };

  const handleImport = () => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      if (base64) {
        importMutation.mutate({ studySetId, fileBase64: base64, fileName: file.name });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 text-xs h-8">
          <Upload size={13} />
          Import Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FileSpreadsheet size={20} className="text-green-600" />
            </div>
            <div>
              <DialogTitle>Import Flashcards từ Excel</DialogTitle>
              <DialogDescription>
                Upload file .xlsx để thêm flashcards hàng loạt
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Download template */}
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <Download size={14} className="text-blue-600" />
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Tải file mẫu Excel
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-blue-200 text-blue-600 hover:bg-blue-100"
              onClick={() => templateMutation.mutate()}
              disabled={templateMutation.isPending}
            >
              {templateMutation.isPending ? (
                <Loader2 size={11} className="animate-spin" />
              ) : (
                "Tải mẫu"
              )}
            </Button>
          </div>

          {/* File upload zone */}
          <div
            className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFile}
              className="hidden"
            />
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 size={28} className="text-green-500" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="text-xs text-red-500 hover:underline mt-1"
                >
                  Xoá file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload size={28} className="text-gray-300" />
                <p className="text-sm text-gray-500">
                  Kéo thả hoặc click để chọn file
                </p>
                <p className="text-xs text-gray-400">.xlsx, .xls</p>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
            <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
            <span>File cần có 2 cột: <strong>Term</strong> và <strong>Definition</strong>. Xem file mẫu để biết định dạng chính xác.</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Huỷ</Button>
          <Button
            disabled={!file || importMutation.isPending}
            onClick={handleImport}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {importMutation.isPending ? (
              <><Loader2 size={14} className="animate-spin mr-2" />Đang import...</>
            ) : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
