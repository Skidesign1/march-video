"use client";
import React from "react";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import { ImageResource } from "../entity/ImageResource";
import { UploadButton } from "../shared/UploadButton";
import { uploadImageToCloudinary, fetchUrlsCloudinary } from "@/utils/cloudinary";
import { useState } from "react";
import Loader from "../entity/Loader";
import { getUid } from "@/utils";
export const ImageResourcesPanel = observer(() => {
  const [loadingFetch, setLoadingFetch]=useState(true)
  const store = React.useContext(StoreContext);
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return; 
    const imgUrl = await uploadImageToCloudinary(file) ||''
    // console.log(imgUrl)
    // store.addImageResource(URL.createObjectURL(file));
    store.addImageResource(imgUrl);
  };
  const handleCloudImg = async () => {
    
    const cloudMedia:any = await fetchUrlsCloudinary()
    const cloudUrls = cloudMedia.imgURLs
    if(cloudUrls){
      setLoadingFetch(false)
      cloudUrls.forEach((url:string) => {
        store.addImageResource(url);
      });
    }

  };
  return (
    <>
      <div className="text-sm px-[16px] pt-[16px] pb-[8px] font-semibold">
        Images
      </div>
      <div className="flex flex-row-reverse justify-end">
      <UploadButton
        accept="image/*"
        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold text-center mx-2 py-2 px-4 rounded cursor-pointer"
        onChange={handleFileChange}
      />
      <div onClick={handleCloudImg} className="bg-gray-300 hover:bg-green-400 text-gray-800 font-bold text-center mx-2 py-2 px-4 rounded cursor-pointer">
        Trending
      </div>
      </div>
      <div >
        {store.images.map((image, index) => {
          return <ImageResource key={getUid()} image={image} index={index} />;
        })}
      </div>
      {loadingFetch&&<Loader/>}
    </>
  );
});
