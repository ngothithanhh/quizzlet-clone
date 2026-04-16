"use client";

import { useRef, useState } from "react";
import {
  CheckCircle2,
  Image as ImageIcon,
  Languages,
  Loader2,
  Music,
  ArrowRightLeft,
  SpellCheck,
  Volume2,
  XCircle,
} from "lucide-react";

import { Button } from "@acme/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";
import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";

interface FlashcardToolbarProps {
  term: string;
  definition: string;
  onTranslated?: (translation: string) => void;
  onAudioUrl?: (audioUrl: string) => void;
  onImageUrl?: (imageUrl: string) => void;
  onSpellResult?: (result: { correct: boolean; corrected?: string }) => void;
}

export default function FlashcardToolbar({
  term,
  definition,
  onTranslated,
  onAudioUrl,
  onImageUrl,
  onSpellResult,
}: FlashcardToolbarProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // TTS — use browser's built-in speechSynthesis API
  // (Google Translate TTS URL gets blocked by CORS)
  const handleTTS = () => {
    if (!term || typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(term);
    utter.lang = "en";
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
  };

  // Translate: two directions
  const [translatingViEn, setTranslatingViEn] = useState(false);
  const [translatingEnVi, setTranslatingEnVi] = useState(false);

  const translateQuery = api.externalApi.translate.useQuery(
    { text: term, from: "vi", to: "en" },
    { enabled: false },
  );

  const handleTranslateViEn = async () => {
    if (!term) return;
    setTranslatingViEn(true);
    try {
      const result = await translateQuery.refetch();
      if (result.data?.result) {
        onTranslated?.(result.data.result);
        toast.success(`VI→EN: "${result.data.result}"`);
      }
    } finally {
      setTranslatingViEn(false);
    }
  };

  // EN → VI query
  const translateEnViQuery = api.externalApi.translate.useQuery(
    { text: term, from: "en", to: "vi" },
    { enabled: false },
  );

  const handleTranslateEnVi = async () => {
    if (!term) return;
    setTranslatingEnVi(true);
    try {
      const result = await translateEnViQuery.refetch();
      if (result.data?.result) {
        onTranslated?.(result.data.result);
        toast.success(`EN→VI: "${result.data.result}"`);
      }
    } finally {
      setTranslatingEnVi(false);
    }
  };

  // Spellcheck term
  const spellcheckMutation = api.externalApi.spellcheck.useMutation({
    onSuccess: (data) => {
      onSpellResult?.(data);
      if (data.correct) {
        toast.success("✅ Chính tả đúng!");
      } else {
        toast.error(`❌ Gợi ý: ${data.corrected ?? data.suggestions?.join(", ")}`);
      }
    },
    onError: () => toast.error("Không thể kiểm tra chính tả"),
  });

  // Upload image
  const uploadImageMutation = api.externalApi.uploadImage.useMutation({
    onSuccess: (data) => {
      onImageUrl?.(data.url);
      toast.success("Đã tải ảnh lên thành công!");
    },
    onError: () => toast.error("Upload ảnh thất bại"),
  });

  // Upload audio
  const uploadAudioMutation = api.externalApi.uploadAudio.useMutation({
    onSuccess: (data) => {
      onAudioUrl?.(data.url);
      toast.success("Đã tải audio lên thành công!");
    },
    onError: () => toast.error("Upload audio thất bại"),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      if (base64) {
        uploadImageMutation.mutate({ base64, fileName: file.name });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      if (base64) {
        uploadAudioMutation.mutate({ base64, fileName: file.name });
      }
    };
    reader.readAsDataURL(file);
  };

  const tools = [
    {
      icon: Volume2,
      label: "Nghe phát âm",
      loading: false,
      disabled: !term,
      onClick: handleTTS,
      color: "text-blue-500 hover:text-blue-600",
    },
    {
      icon: Languages,
      label: "Dịch VI → EN (ghi vào Definition)",
      loading: translatingViEn,
      disabled: !term,
      onClick: handleTranslateViEn,
      color: "text-green-500 hover:text-green-600",
    },
    {
      icon: ArrowRightLeft,
      label: "Dịch EN → VI (ghi vào Definition)",
      loading: translatingEnVi,
      disabled: !term,
      onClick: handleTranslateEnVi,
      color: "text-teal-500 hover:text-teal-600",
    },
    {
      icon: SpellCheck,
      label: "Kiểm tra chính tả",
      loading: spellcheckMutation.isPending,
      disabled: !term,
      onClick: () => spellcheckMutation.mutate({ text: term }),
      color: "text-orange-500 hover:text-orange-600",
    },
    {
      icon: ImageIcon,
      label: "Thêm ảnh",
      loading: uploadImageMutation.isPending,
      disabled: false,
      onClick: () => imageInputRef.current?.click(),
      color: "text-purple-500 hover:text-purple-600",
    },
    {
      icon: Music,
      label: "Thêm âm thanh",
      loading: uploadAudioMutation.isPending,
      disabled: false,
      onClick: () => audioInputRef.current?.click(),
      color: "text-pink-500 hover:text-pink-600",
    },
  ];

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-0.5">
        {tools.map((tool, i) => (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={tool.onClick}
                disabled={tool.disabled || tool.loading}
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${tool.color} hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                {tool.loading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <tool.icon size={13} />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {tool.label}
            </TooltipContent>
          </Tooltip>
        ))}

        {/* Hidden file inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleAudioChange}
        />
      </div>
    </TooltipProvider>
  );
}
