"use client";
import React from "react";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import { VideoResource } from "../entity/VideoResource";
import { UploadButton } from "../shared/UploadButton";
import { uploadVideoToCloudinary } from "@/utils/cloudinary";


export const VideoResourcesPanel = observer(() => {
  const store = React.useContext(StoreContext);
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // store.addVideoResource(URL.createObjectURL(file));
    // const videoUrl = await uploadVideoToCloudinary(file)||''
    // store.addVideoResource(videoUrl);
    store.addVideoResource("https://res.cloudinary.com/ski-studio/video/upload/v1711436437/kxwzlmccvltiqgf3obtr.mp4");
  };
  return (
    <>
      <div className="text-sm px-[16px] pt-[16px] pb-[8px] font-semibold">
        Videos
      </div>
      {store.videos.map((video, index) => {
        return <VideoResource key={video} video={video} index={index} />;
      })}
      <UploadButton
        accept="video/mp4,video/x-m4v,video/*"
        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold text-center mx-2 py-2 px-4 rounded cursor-pointer"
        onChange={handleFileChange}
      />
    </>
  );
});
