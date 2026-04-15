"use client";

import { useEffect } from "react";

import { useAuth } from "~/contexts/auth-context";
import { api } from "~/trpc/react";

const CreateActivity = () => {
  const { isLoggedIn } = useAuth();
  const { mutate } = api.activity.create.useMutation();

  useEffect(() => {
    if (isLoggedIn) {
      mutate();
    }
  }, [isLoggedIn]);

  return null;
};

export default CreateActivity;
