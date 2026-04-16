"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Reorder } from "framer-motion";
import { Download, LoaderCircle, Music, PlusIcon, Trash2Icon, X } from "lucide-react";

import type { RouterOutputs } from "@acme/api";
import type { StudySetValues } from "@acme/validators";
import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { Card, CardContent, CardHeader } from "@acme/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFieldArray,
  useForm,
} from "@acme/ui/form";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { Separator } from "@acme/ui/separator";
import { Textarea } from "@acme/ui/textarea";
import { toast } from "@acme/ui/toast";
import { StudySetSchema } from "@acme/validators";

import { api } from "~/trpc/react";
import CloneFlashcardsDialog from "./clone-flashcards-dialog";
import FlashcardToolbar from "./flashcard-toolbar";
import ImportExcelDialog from "./import-excel-dialog";
import ImportExcelIntoForm from "./import-excel-into-form";

const initialFlashcards = Array.from({ length: 4 }, (_, index) => ({
  term: "",
  definition: "",
  position: index,
}));

interface StudySetFormProps {
  defaultValues?: RouterOutputs["studySet"]["byId"];
}

const StudySetForm = ({ defaultValues }: StudySetFormProps) => {
  const form = useForm({
    schema: StudySetSchema,
    defaultValues: {
      id: defaultValues?.id,
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      flashcards: defaultValues?.flashcards ?? initialFlashcards,
    },
  });
  const { fields, append, remove, swap } = useFieldArray({
    name: "flashcards",
    control: form.control,
    keyName: "fieldId",
  });
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const utils = api.useUtils();
  const isEditing = !!defaultValues?.id;
  const create = api.studySet.create.useMutation({
    onSuccess() {
      form.reset({});
      toast.success("Created new study set");
      void utils.studySet.invalidate();
      router.push("/latest");
    },
    onError(error) {
      toast.error(error.message);
    },
  });
  const update = api.studySet.update.useMutation({
    onSuccess(data) {
      toast.success("Study set saved");
      void utils.studySet.invalidate();
      router.push(`/study-sets/${data.id}`);
    },
    onError(error) {
      toast.error(error.message);
    },
  });

  // Export Excel
  const exportMutation = api.flashcard.exportExcel.useMutation({
    onSuccess: (data) => {
      const link = document.createElement("a");
      link.href = `data:${data.contentType};base64,${data.base64}`;
      link.download = data.filename || "flashcards.xlsx";
      link.click();
      toast.success("Đã xuất file Excel!");
    },
    onError: () => toast.error("Xuất Excel thất bại"),
  });

  const isPending = isEditing ? update.isPending : create.isPending;
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false);
      return;
    }

    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [fields.length]);

  const onSubmit = (values: StudySetValues) => {
    const flashcards = values.flashcards.map((flashcard, index) => ({
      ...flashcard,
      position: index,
    }));

    if (isEditing && defaultValues?.id) {
      update.mutate({ ...values, flashcards, id: defaultValues.id });
    } else {
      create.mutate({ ...values, flashcards });
    }
  };

  const addFlashcard = () => {
    append({
      term: "",
      definition: "",
      position: fields.length,
    });
  };

  const swapCards = (from: number, to: number) => {
    swap(from, to);
  };

  return (
    <div ref={ref} className="m-auto max-w-xl py-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    disabled={create.isPending}
                    placeholder="Mathematics"
                    {...field}
                  />
                </FormControl>
                <FormDescription>This is your study set title.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={create.isPending}
                    placeholder="Addition learning set..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This is your study set description.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ── Flashcards section ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label
                className={cn({
                  "text-destructive": form.formState.errors.flashcards?.root,
                })}
              >
                Flashcards
              </Label>

              {/* Toolbar: Import into form (ALWAYS) | Export + Clone (edit only) */}
              <div className="flex items-center gap-1.5">
                <ImportExcelIntoForm
                  label="Import Excel"
                  onImport={(cards) => {
                    form.setValue("flashcards", cards, { shouldValidate: true });
                  }}
                />

                {isEditing && defaultValues?.id && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2 text-xs h-8"
                      onClick={() => exportMutation.mutate({ studySetId: defaultValues.id! })}
                      disabled={exportMutation.isPending}
                    >
                      {exportMutation.isPending ? (
                        <LoaderCircle size={13} className="animate-spin" />
                      ) : (
                        <Download size={13} />
                      )}
                      Export Excel
                    </Button>
                    <CloneFlashcardsDialog currentStudySetId={defaultValues.id} />
                  </>
                )}
              </div>
            </div>

            {form.formState.errors.flashcards?.root && (
              <p className="text-[0.8rem] font-medium text-destructive mb-2">
                {form.formState.errors.flashcards.root.message}
              </p>
            )}

            <Reorder.Group
              axis="y"
              values={fields}
              onReorder={(newOrder) => {
                const activeElement = fields[active];
                newOrder.forEach((item, index) => {
                  if (item === activeElement) {
                    swapCards(active, index);
                    setActive(index);
                  }
                });
              }}
              className="mt-2 flex flex-col gap-8"
            >
              {fields.map((field, index) => (
                <Reorder.Item
                  key={field.fieldId}
                  value={field}
                  onDragStart={() => setActive(index)}
                >
                  <Card>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 font-medium">{index + 1}</span>
                        <div className="flex items-center gap-1">
                          {/* External API toolbar (TTS, Translate, Spellcheck, Upload) */}
                          <FlashcardToolbar
                            term={form.watch(`flashcards.${index}.term`)}
                            definition={form.watch(`flashcards.${index}.definition`)}
                            onTranslated={(tr) =>
                              form.setValue(
                                `flashcards.${index}.definition`,
                                tr,
                                { shouldValidate: true },
                              )
                            }
                            onImageUrl={(url) =>
                              form.setValue(
                                `flashcards.${index}.imageUrl`,
                                url,
                                { shouldValidate: true },
                              )
                            }
                            onAudioUrl={(url) =>
                              form.setValue(
                                `flashcards.${index}.audioUrl`,
                                url,
                                { shouldValidate: true },
                              )
                            }
                          />
                          <Separator orientation="vertical" className="h-5 mx-1" />
                          <Button
                            type="button"
                            onClick={() => remove(index)}
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-gray-400 hover:text-red-500"
                          >
                            <Trash2Icon size={14} />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex gap-4">
                        <FormField
                          control={form.control}
                          name={`flashcards.${index}.term`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Thuật ngữ</FormLabel>
                              <FormControl>
                                <div
                                  data-value={field.value}
                                  className="grid after:invisible after:whitespace-pre-wrap after:border after:py-2 after:text-sm after:content-[attr(data-value)_'\n'] after:[grid-area:1/1]"
                                >
                                  <Textarea
                                    disabled={create.isPending}
                                    placeholder="2+2"
                                    {...field}
                                    className="min-h-10 resize-none [grid-area:1/1]"
                                    rows={1}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`flashcards.${index}.definition`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Định nghĩa</FormLabel>
                              <FormControl>
                                <div
                                  data-value={field.value}
                                  className="grid after:invisible after:whitespace-pre-wrap after:border after:py-2 after:text-sm after:content-[attr(data-value)_'\n'] after:[grid-area:1/1]"
                                >
                                  <Textarea
                                    disabled={create.isPending}
                                    placeholder="4"
                                    {...field}
                                    className="min-h-10 resize-none [grid-area:1/1]"
                                    rows={1}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Image preview */}
                      {form.watch(`flashcards.${index}.imageUrl`) && (
                        <div className="relative inline-block">
                          <img
                            src={form.watch(`flashcards.${index}.imageUrl`)}
                            alt="flashcard image"
                            className="h-24 w-auto rounded-md border object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              form.setValue(`flashcards.${index}.imageUrl`, undefined)
                            }
                            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white shadow"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      )}

                      {/* Audio preview */}
                      {form.watch(`flashcards.${index}.audioUrl`) && (
                        <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                          <Music size={14} className="shrink-0 text-pink-500" />
                          <span className="flex-1 truncate text-xs text-muted-foreground">
                            {form.watch(`flashcards.${index}.audioUrl`)?.split("/").pop()}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              form.setValue(`flashcards.${index}.audioUrl`, undefined)
                            }
                            className="text-destructive hover:opacity-80"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Reorder.Item>
              ))}
            </Reorder.Group>
            <Button
              type="button"
              onClick={addFlashcard}
              className="mt-8 w-full"
              variant="outline"
            >
              <PlusIcon className="mr-2 size-4" />
              Add flashcard
            </Button>
          </div>
          <Button
            disabled={isPending}
            type="submit"
            className="w-full"
            size="lg"
          >
            {isPending ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <>{defaultValues ? "Save" : "Create"} study set</>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default StudySetForm;
