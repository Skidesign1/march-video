"use client";
import React from "react";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import { AudioResource } from "../entity/AudioResource";
import { UploadButton } from "../shared/UploadButton";
import { uploadAudioToCloudinary } from "@/utils/cloudinary";

export const AudioResourcesPanel = observer(() => {
  const store = React.useContext(StoreContext);
  const handleFileChange = async(event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // const AudioUrl = await uploadAudioToCloudinary(file)||''
    // store.addAudioResource(AudioUrl);
    // console.log(URL.createObjectURL(file))
    store.addAudioResource("https://res.cloudinary.com/ski-studio/video/upload/v1711457442/rqyeo5kjuysqr25cevfb.mp3");
    // store.addAudioResource(URL.createObjectURL(file));
  };
  return (
    <>
      <div className="text-sm px-[16px] pt-[16px] pb-[8px] font-semibold">
        Audios
      </div>
      {store.audios.map((audio, index) => {
        return <AudioResource key={audio} audio={audio} index={index} />;
      })}
      <UploadButton
        accept="audio/mp3,audio/*"
        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold text-center mx-2 py-2 px-4 rounded cursor-pointer"
        onChange={handleFileChange}
      />
    </>
  );
});
