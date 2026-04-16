import type { RouterOutputs } from "@acme/api";

import { api } from "~/trpc/react";
import ToggleCard from "../shared/toggle-card";

export default function StudySetFolderCard({
  folder: { id, name },
  isIn,
  studySetId,
}: {
  isIn: boolean;
  studySetId: string;
  folder: RouterOutputs["folder"]["allByUser"][number];
}) {
  const utils = api.useUtils();
  const addSet = api.folder.addSet.useMutation({
    onSettled,
    onMutate() {
      const prevData = utils.studySet.byId.getData({ id: studySetId });

      utils.studySet.byId.setData({ id: studySetId }, (old) => {
        if (!old) return;
        return {
          ...old,
          folders: [...(old.folders ?? []), { id }],
        };
      });

      return { prevData };
    },
    onError(_err, _vars, ctx) {
      // rollback on error
      if (ctx?.prevData) {
        utils.studySet.byId.setData({ id: studySetId }, ctx.prevData);
      }
    },
  });

  const removeSet = api.folder.removeSet.useMutation({
    onSettled,
    onMutate() {
      const prevData = utils.studySet.byId.getData({ id: studySetId });

      utils.studySet.byId.setData({ id: studySetId }, (old) => {
        if (!old) return;
        return {
          ...old,
          folders: (old.folders ?? []).filter((folder) => folder.id !== id),
        };
      });

      return { prevData };
    },
    onError(_err, _vars, ctx) {
      if (ctx?.prevData) {
        utils.studySet.byId.setData({ id: studySetId }, ctx.prevData);
      }
    },
  });

  async function onSettled() {
    // Invalidate the studySet so `folders` list is fresh from server
    await utils.studySet.byId.invalidate({ id: studySetId });
    await utils.folder.allByUser.invalidate();
  }

  function onClick() {
    const params = { folderId: id, studySetId };
    if (isIn) {
      removeSet.mutate(params);
    } else {
      addSet.mutate(params);
    }
  }

  return <ToggleCard isIn={isIn} onClick={onClick} name={name} />;
}
