"use client";
import React from "react";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import { SketchPicker } from "react-color";
import { useState } from 'react';
import { rgbaToHex } from "@/utils/rgbToHex";
const professionalVideoColors = [
  "#000000", // Black
  "#FFFFFF", // White
  "#404040", // Dark Gray
  "#808080", // Gray
  "#C0C0C0", // Silver
  "#E0E0E0", // Light Gray
  "#003366", // Dark Blue
  "#336699", // Medium Blue
  "#6699CC", // Blue
  "#99CCFF", // Light Blue
  "#990000", // Dark Red
  "#CC3333", // Red
  "#FF6666", // Light Red
  "#663300", // Dark Brown
  "#996633", // Brown
  "#CC9966", // Light Brown
  "#006600", // Dark Green
  "#339933", // Green
  "#66CC99", // Light Green
  "#FFFF00", // Yellow
];

export const ColourPanel = observer(() => {
  const store = React.useContext(StoreContext);
  const handleChangeComplete = (color:any) => {
    setCurrenColor(color.rgb)
    
  };
  const [currentColour, setCurrenColor]=useState( 
    {r: 45, g: 109, b: 90, a: 1})
  
  
    

  // Color Picker
  return (
    <>
      <div className="text-sm px-[16px] pt-[16px] pb-[8px] font-semibold">
        Select Color
      </div>
      <div className="flex items-center justify-center">
        <SketchPicker
          color={ currentColour }
          onChange={ handleChangeComplete }
          onChangeComplete={(color: any) => {
            
            handleChangeComplete
            store?.changeElementFill(rgbaToHex(currentColour));
            
          }}
        ></SketchPicker>
      </div>
    </>
  );
});
