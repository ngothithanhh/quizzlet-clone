"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
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

export interface ParsedFlashcard {
  term: string;
  definition: string;
  position: number;
}

interface ImportExcelIntoFormProps {
  /** Gọi khi parse xong — nhận mảng flashcard để điền vào form */
  onImport: (cards: ParsedFlashcard[]) => void;
  /** Nhãn nút trigger (mặc định "Import Excel") */
  label?: string;
}

/**
 * Dialog parse Excel không cần studySetId.
 * Kết quả được trả về qua callback onImport để populate form fields.
 * Hoạt động cho cả Create (chưa có ID) và Edit mode.
 */
export default function ImportExcelIntoForm({
  onImport,
  label = "Import Excel",
}: ImportExcelIntoFormProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ term: string; definition: string }[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseMutation = api.flashcard.parseExcel.useMutation({
    onSuccess: (data) => {
      setPreview(data);
      toast.success(`Đọc được ${data.length} flashcard từ file`);
    },
    onError: (err) => toast.error(err.message ?? "Không thể đọc file Excel"),
  });

  const templateMutation = api.flashcard.downloadTemplate.useMutation({
    onSuccess: (data) => {
      const link = document.createElement("a");
      link.href = `data:${data.contentType};base64,${data.base64}`;
      link.download = data.filename ?? "flashcard_template.xlsx";
      link.click();
    },
    onError: () => toast.error("Không thể tải template"),
  });

  const parseFile = (f: File) => {
    if (!f.name.match(/\.xlsx?$/i)) {
      toast.error("Vui lòng chọn file Excel (.xlsx hoặc .xls)");
      return;
    }
    setFile(f);
    setPreview([]);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      if (base64) parseMutation.mutate({ fileBase64: base64, fileName: f.name });
    };
    reader.readAsDataURL(f);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) parseFile(selected);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) parseFile(dropped);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleConfirm = () => {
    const cards: ParsedFlashcard[] = preview.map((c, i) => ({
      term: c.term,
      definition: c.definition,
      position: i,
    }));
    onImport(cards);
    setOpen(false);
    setFile(null);
    setPreview([]);
    toast.success(`Đã thêm ${cards.length} flashcard vào form`);
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) { setFile(null); setPreview([]); }
    setOpen(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-2 text-xs h-8">
          <Upload size={13} />
          {label}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FileSpreadsheet size={20} className="text-green-600" />
            </div>
            <div>
              <DialogTitle>Import Flashcards từ Excel</DialogTitle>
              <DialogDescription>
                Upload file .xlsx — flashcards sẽ được điền vào form để bạn xem trước khi lưu
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Download template */}
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <Download size={14} className="text-blue-600" />
              <span className="text-sm text-blue-700 dark:text-blue-300">Tải file mẫu Excel</span>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-xs border-blue-200 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40"
              onClick={() => templateMutation.mutate()}
              disabled={templateMutation.isPending}
            >
              {templateMutation.isPending
                ? <Loader2 size={11} className="animate-spin" />
                : "Tải mẫu"}
            </Button>
          </div>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragOver
                ? "border-green-500 bg-green-50 dark:bg-green-900/20 scale-[1.01]"
                : "border-gray-200 dark:border-gray-700 hover:border-green-400 hover:bg-green-50/30 dark:hover:bg-green-900/10"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            {parseMutation.isPending ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 size={28} className="animate-spin text-green-500" />
                <p className="text-sm text-gray-500">Đang đọc file...</p>
              </div>
            ) : file ? (
              <div className="flex flex-col items-center gap-1.5">
                <CheckCircle2 size={28} className="text-green-500" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); setPreview([]); }}
                  className="text-xs text-red-500 hover:underline mt-1"
                >
                  Xoá file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload size={28} className="text-gray-300" />
                <p className="text-sm text-gray-500">Kéo thả hoặc click để chọn file</p>
                <p className="text-xs text-gray-400">.xlsx, .xls</p>
              </div>
            )}
          </div>

          {/* Format hint */}
          <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
            <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
            <span>
              File cần có 2 cột: <strong>Term</strong> (cột A) và <strong>Definition</strong> (cột B). Dòng đầu tiên là tiêu đề, bỏ qua.
            </span>
          </div>

          {/* Preview table */}
          {preview.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">
                Xem trước — {preview.length} flashcard
              </p>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-100 dark:border-gray-800">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 text-gray-500">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium w-8">#</th>
                      <th className="text-left px-3 py-2 font-medium">Term</th>
                      <th className="text-left px-3 py-2 font-medium">Definition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 20).map((row, i) => (
                      <tr key={i} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-3 py-1.5 text-gray-400">{i + 1}</td>
                        <td className="px-3 py-1.5 font-medium text-gray-900 dark:text-white max-w-[160px] truncate">
                          {row.term}
                        </td>
                        <td className="px-3 py-1.5 text-gray-600 dark:text-gray-400 max-w-[160px] truncate">
                          {row.definition}
                        </td>
                      </tr>
                    ))}
                    {preview.length > 20 && (
                      <tr>
                        <td colSpan={3} className="px-3 py-1.5 text-center text-gray-400">
                          … và {preview.length - 20} flashcard khác
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Huỷ
          </Button>
          <Button
            type="button"
            disabled={preview.length === 0 || parseMutation.isPending}
            onClick={handleConfirm}
            className="bg-green-600 hover:bg-green-700 text-white gap-2"
          >
            <CheckCircle2 size={14} />
            Thêm {preview.length > 0 ? `${preview.length} flashcard` : "vào form"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
