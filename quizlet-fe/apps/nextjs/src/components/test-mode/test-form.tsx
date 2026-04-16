import { z } from "zod";

import type { RouterOutputs } from "@acme/api";
import { Button } from "@acme/ui/button";
import { Form, FormField, useFieldArray, useForm } from "@acme/ui/form";

import type { Answers } from "./test-mode";
import MultipleChoiceCard from "../shared/multiple-choice-card";
import TrueFalseCard from "../shared/true-false-card";
import WrittenCard from "../shared/written-card";

// NOTE: react-hook-form's useFieldArray may replace each item's `id` with an
// internal UUID string for React key tracking. Using passthrough + only
// validating `userAnswer` avoids silent schema mismatches on metadata fields.
const withUserAnswer = (required: string) =>
  z.object({ userAnswer: z.string().min(1, required) }).passthrough();

const testSchema = z.object({
  trueOrFalse: z.array(withUserAnswer("Please choose an answer (True/False)")),
  multipleChoice: z.array(withUserAnswer("Please choose an answer")),
  written: z.array(withUserAnswer("Please write your answer")),
});

interface TestFormProps {
  test: RouterOutputs["studySet"]["testCards"];
  onSubmit: (answer: Answers) => void;
}

const TestForm = ({ test, onSubmit }: TestFormProps) => {
  const initalData = {
    multipleChoice: test.multipleChoice.map((i) => ({ ...i, userAnswer: "" })),
    trueOrFalse: test.trueOrFalse.map((i) => ({ ...i, userAnswer: "" })),
    written: test.written.map((i) => ({ ...i, userAnswer: "" })),
  };
  const form = useForm({
    schema: testSchema,
    defaultValues: initalData,
  });
  const { fields: multipleChoice } = useFieldArray({
    control: form.control,
    name: "multipleChoice",
  });
  const { fields: trueOrFalse } = useFieldArray({
    control: form.control,
    name: "trueOrFalse",
  });
  const { fields: written } = useFieldArray({
    control: form.control,
    name: "written",
  });

  const handleInvalid = (errors: unknown) => {
    console.error("[TestForm] Validation failed — unanswered questions:", errors);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit as any, handleInvalid)}
        className="space-y-8"
      >
        {trueOrFalse.map(({ term, answer, id }, index) => (
          <FormField
            key={id}
            control={form.control}
            name={`trueOrFalse.${index}.userAnswer`}
            render={({ field }) => (
              <TrueFalseCard
                term={term}
                answer={answer}
                index={index}
                {...field}
              />
            )}
          />
        ))}
        {multipleChoice.map(({ term, id, answers }, index) => (
          <FormField
            key={id}
            control={form.control}
            name={`multipleChoice.${index}.userAnswer`}
            render={({ field }) => (
              <MultipleChoiceCard
                term={term}
                index={index}
                answers={answers}
                {...field}
              />
            )}
          />
        ))}
        {written.map(({ term, id }, index) => (
          <FormField
            key={id}
            control={form.control}
            name={`written.${index}.userAnswer`}
            render={({ field }) => (
              <WrittenCard key={id} term={term} {...field} />
            )}
          />
        ))}
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default TestForm;
