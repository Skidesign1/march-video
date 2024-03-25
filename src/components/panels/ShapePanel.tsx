"use client";
import React from "react";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import { ShapeResource } from "../entity/ShapeResource"; 
import { MdSquare, MdCircle, MdOutlineHorizontalRule, MdRectangle, MdPentagon, MdHexagon, MdOutlineStar } from "react-icons/md";
import { TbTriangleFilled } from "react-icons/tb";
import { BiSolidPolygon } from "react-icons/bi";
import { CgShapeRhombus } from "react-icons/cg";

import { PiParallelogramFill } from "react-icons/pi";
import { IoEllipse } from "react-icons/io5";
import { TbOvalFilled } from "react-icons/tb";
import { IoMdHeart } from "react-icons/io";



export const ShapePanel = observer(() => {
const store = React.useContext(StoreContext);
  
  return (
    <div className="bg-slate-800 h-full">
      <div className="text-sm px-[16px] pt-[16px] pb-[8px] font-semibold text-white">
        Add Shape
      </div>
      <ShapeResource icon={<MdRectangle size="20" />} type="rect" radius={0} width={150} height={100} fill="grey" stroke="black" strokeWidth={3}/>
      <ShapeResource icon={<MdSquare size="20" />} type="rect" radius={0} width={100} height={100} fill="grey" stroke="black" strokeWidth={3}/>
      <ShapeResource icon={<TbTriangleFilled size="20"/>} type="triangle" radius={0} width={50} height={50} fill="grey" stroke="black" strokeWidth={3}/>
      <ShapeResource icon={<MdCircle size="20" />} type="circle" width={50} height={50} radius={10} fill="grey" stroke="black" strokeWidth={3}/>
      <ShapeResource icon={<MdOutlineHorizontalRule size="20" />} type="line" width={50} height={50} radius={0} fill="grey" stroke="white" strokeWidth={2}/>
      <ShapeResource icon={<BiSolidPolygon size="20" />} type="octagon"  width={100} height={100} radius={0} fill="grey" stroke="white" strokeWidth={5}/>
      <ShapeResource icon={<MdPentagon size="20" />} type="pentagon" width={100} height={100} radius={0} fill="grey" stroke="white" strokeWidth={5}/>
      <ShapeResource icon={<MdHexagon size="20" />} type="hexagon" width={100} height={100} radius={0} fill="grey" stroke="white" strokeWidth={5}/>
      <ShapeResource icon={<CgShapeRhombus size="20" />} type="rhombus" width={100} height={100} radius={0} fill="grey" stroke="white" strokeWidth={5}/>
      <ShapeResource icon={<CgShapeRhombus size="20" />} type="trapezoid" width={100} height={100} radius={0} fill="grey" stroke="white" strokeWidth={5}/>
      <ShapeResource icon={<PiParallelogramFill size="20" />} type="parallelogram" width={100} height={100} radius={0} fill="grey" stroke="white" strokeWidth={5}/>
      <ShapeResource icon={<IoEllipse size="20" />} type="ellipse" width={100} height={100} radius={0} fill="grey" stroke="grey" strokeWidth={5}/>
      <ShapeResource icon={<TbOvalFilled size="20" />} type="oval" width={100} height={100} radius={0} fill="grey" stroke="grey" strokeWidth={5}/>
      <ShapeResource icon={<MdOutlineStar size="20" />} type="star" width={100} height={100} radius={0} fill="grey" stroke="grey" strokeWidth={5}/>
      <ShapeResource icon={<IoMdHeart size="20" />} type="heart" width={100} height={100} radius={0} fill="grey" stroke="grey" strokeWidth={5}/>
    </div>
  );
});
