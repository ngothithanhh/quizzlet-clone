"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Loader2, User } from "lucide-react";

import { useAuth } from "~/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { Card, CardContent } from "@acme/ui/card";
import Cropper from "@acme/ui/cropper";
import { Dropzone } from "@acme/ui/dropzone";
import { Separator } from "@acme/ui/separator";
import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";

const profilePictures = [
  "dog.jpg",
  "frog.jpg",
  "lion.jpg",
  "monkey.jpg",
  "rabbit.jpg",
];

const EditProfilePicture = () => {
  const { user, refreshUser } = useAuth();
  const [image, setImage] = useState<string | undefined>(
    user?.image ?? user?.avatarUrl ?? undefined,
  );
  const [uploading, setUploading] = useState(false);

  const { mutate } = api.user.update.useMutation({
    onSuccess(data) {
      setImage(data.avatarUrl ?? undefined);
      toast.success("Đã cập nhật ảnh đại diện!");
      refreshUser?.();
    },
    onError: () => toast.error("Cập nhật ảnh thất bại"),
  });

  const uploadMutation = api.externalApi.uploadImage.useMutation({
    onSuccess(data) {
      mutate({ avatarUrl: data.url });
      setUploading(false);
    },
    onError() {
      toast.error("Upload ảnh thất bại");
      setUploading(false);
    },
  });

  const updateUserImage = (avatarUrl: string) => {
    mutate({ avatarUrl });
  };

  const uploadAndUpdate = async (file: File) => {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      if (base64) {
        uploadMutation.mutate({ base64, fileName: file.name });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
      <div className="flex items-center gap-4 lg:basis-48 lg:flex-col">
        <Avatar className="h-16 w-16">
          <AvatarImage src={image} alt="user avatar" />
          <AvatarFallback>
            <User />
          </AvatarFallback>
        </Avatar>
        <span className="text-xl font-semibold">Ảnh đại diện</span>
      </div>
      <Card className="flex-1">
        <CardContent className="p-6">
          <span className="mb-4 inline-block text-base font-bold">
            Choose your profile picture
          </span>
          <div className="flex flex-wrap gap-2">
            {profilePictures.map((picture) => (
              <Image
                key={picture}
                onClick={() => updateUserImage(`/images/${picture}`)}
                src={`/images/${picture}`}
                alt=""
                width={48}
                height={48}
                className="cursor-pointer rounded-full border hover:ring-2 hover:ring-indigo-400 transition-all"
              />
            ))}
          </div>
          <Separator className="my-6" />
          {uploading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 size={16} className="animate-spin" /> Đang tải ảnh lên...
            </div>
          ) : (
            <Cropper aspect={1 / 1} afterCrop={uploadAndUpdate}>
              <Dropzone />
            </Cropper>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProfilePicture;
