"use client";
import React from "react";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import { VideoResource } from "../entity/VideoResource";
import { UploadButton } from "../shared/UploadButton";
import { uploadVideoToCloudinary,fetchUrlsCloudinary } from "@/utils/cloudinary";
import Loader from "../entity/Loader";
import { useState } from "react";
import { getUid } from "@/utils";


export const VideoResourcesPanel = observer(() => {
  const store = React.useContext(StoreContext);
  const [loadingUpload, setLoadingUpload]=useState(false)
  const [loadingFetch, setLoadingFetch]=useState(true)
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // store.addVideoResource(URL.createObjectURL(file));
    const videoUrl = await uploadVideoToCloudinary(file)||''
    store.addVideoResource(videoUrl);
    // store.addVideoResource("https://res.cloudinary.com/ski-studio/video/upload/v1711436437/kxwzlmccvltiqgf3obtr.mp4");
  };
  const handleCloudVideos = async () => {
    const cloudMedia:any = await fetchUrlsCloudinary()
    const cloudUrls = cloudMedia.vidURLs
    if(cloudUrls){
      setLoadingFetch(false)
      cloudUrls.forEach((url:string) => {
        store.addVideoResource(url);
      });
    }
  };
  return (
    <>
      <div className="text-sm px-[16px] pt-[16px] pb-[8px] font-semibold">
        Videos
      </div>
      {store.videos.map((video, index) => {
        return <VideoResource key={getUid()} video={video} index={index} />;
      })}
      <div className="flex flex-row-reverse justify-end">

      <UploadButton
        accept="video/mp4,video/x-m4v,video/*"
        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold text-center mx-2 py-2 px-4 rounded cursor-pointer"
        onChange={handleFileChange}
        />
      <div onClick={handleCloudVideos} className="bg-gray-300 hover:bg-green-400 text-gray-800 font-bold text-center mx-2 py-2 px-4 rounded cursor-pointer">
        Trending
      </div>
      </div>
      
      {loadingFetch&&<Loader/>}
      
    </>
  );
});
