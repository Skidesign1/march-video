"use client";
import Image  from "next/image";
import logo from '../../public/favicon.png'
import { fabric } from "fabric";
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from "react";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import { Resources } from "./Resources";
import { ElementsPanel } from "./panels/ElementsPanel";
import { Menu } from "./Menu";
import { TimeLine } from "./TimeLine";
import { Store } from "@/store/Store";
import axios from "axios";
import "@/utils/fabric-utils";

export const EditorWithStore = () => {
  
  const [store] = useState(new Store());
  return (
    <StoreContext.Provider value={store}>
      <Editor></Editor>
    </StoreContext.Provider>
  );
}

export const Editor = observer(() => {
  const params = useParams()
  // const[portrait, setPortrait]=useState(true)
  // const[page, setPage]=useState(0)
  console.log('running editir pge')
  const store = React.useContext(StoreContext);
  let page = store.page

  console.log(page)



  const portraitView = ()=>{
    store.setPage(1)
    store.setPortrait(true)
  }

  const landscapeView = ()=>{
    store.setPage(1)
    store.setPortrait(false)
  }


  useEffect(() => {
    if (store && typeof window !== 'undefined') {
    
      const canvas = store.portrait?new fabric.Canvas("canvas", {
      height: 500,
      width:400,
      backgroundColor: "#ededed",
    }):new fabric.Canvas("canvas", {
      height: 500,
      width:800,
      backgroundColor: "#ededed",
    })
    
    fabric.Object.prototype.transparentCorners = false;
    fabric.Object.prototype.cornerColor = "#00a0f5";
    fabric.Object.prototype.cornerStyle = "circle";
    fabric.Object.prototype.cornerStrokeColor = "#0063d8";
    fabric.Object.prototype.cornerSize = 10;
    
    // canvas mouse down without target should deselect active object
    canvas.on("mouse:down", function (e) {
      if (!e.target) {
        store.setSelectedElement(null);
      }
    });
    
    store.setCanvas(canvas);
    fabric.util.requestAnimFrame(function render() {
      // console.log("fbric rerendering")
      canvas.renderAll();
      fabric.util.requestAnimFrame(render);
    });
    // const jsonData = {"version":"5.3.0","objects":[{"type":"textbox","version":"5.3.0","originX":"left","originY":"top","left":178,"top":118,"width":100,"height":31.64,"fill":"#5a6d5aff","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"fontFamily":"Times New Roman","fontWeight":600,"fontSize":28,"text":"Title","underline":false,"overline":false,"linethrough":false,"textAlign":"left","fontStyle":"normal","lineHeight":1.16,"textBackgroundColor":"","charSpacing":0,"styles":[],"direction":"ltr","path":null,"pathStartOffset":0,"pathSide":"left","pathAlign":"baseline","minWidth":20,"splitByGrapheme":false,"transparentCorners":false,"cornerColor":"#00a0f5","cornerStrokeColor":"#0063d8","borderColor":"rgb(178,204,255)","cornerStyle":"circle","name":"h6c4429"},{"type":"textbox","version":"5.3.0","originX":"left","originY":"top","left":183,"top":154,"width":100,"height":15.82,"fill":"white","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"fontFamily":"Times New Roman","fontWeight":400,"fontSize":14,"text":"Call to Action","underline":false,"overline":false,"linethrough":false,"textAlign":"left","fontStyle":"normal","lineHeight":1.16,"textBackgroundColor":"","charSpacing":0,"styles":[],"direction":"ltr","path":null,"pathStartOffset":0,"pathSide":"left","pathAlign":"baseline","minWidth":20,"splitByGrapheme":false,"transparentCorners":false,"cornerColor":"#00a0f5","cornerStrokeColor":"#0063d8","borderColor":"rgb(178,204,255)","cornerStyle":"circle","name":"tt9u42q"}],"background":"#111111"}
    if(store.templateInfo){
      const fetchTemplateInfo = async () => {
        try {
          if(typeof window !== 'undefined'){
          const token = window.sessionStorage.getItem('token');
  
          // Check if token exists
          if (!token) {
            // Handle case where token is not available
            console.error('Token not found in session.');
            return;
          }
  
          // Define request headers with Authorization header containing the token
          const config = {
            headers: {
              Authorization: `${token}`,
            },
          };
          // Make a POST request to fetch template info using the provided id
          const response = await axios.get(`https://skyestudio-backend.onrender.com/templates/${params.templateId}`, config);
          console.log(response.data)
          store?.setTemplateInfo(response.data);
          console.log('this istemplte info'+ store.templateInfo)
          console.log(store.templateInfo.Category)
          console.log(response.data.data.Category)
          const jsonData = response.data.data.templateFile
          canvas.loadFromJSON(jsonData, function() {
          canvas.renderAll();
      });
         }
        } catch (error) {
          console.error('Error fetching template info:', error);
        }
      };
      if (params.templateId) {
        fetchTemplateInfo();
      }
      return
    }
  }
}, [store.portrait, page]);
return (
  <>
    <div className="flex  justify-between items-center  gap-2 py-3 bg-slate-200">
      <img className="h-[40px] " src='/Logo.png' alt="sky logo" />
      <button className="bg-purple-400 text-white p-4 cursor-pointer" onClick={() => store?.saveVideo()}>Save Video</button>
    </div>
      <div className="grid grid-rows-[500px_1fr_20px] grid-cols-[72px_300px_1fr_250px] ">
      <div className="tile row-span-2 flex flex-col bg-slate-200">
        <Menu />
      </div>
      <div className="row-span-2 flex flex-col overflow-hidden">
        <Resources />
      </div>
      <div id="grid-canvas-container" className="col-start-3 bg-slate-200 flex justify-center items-center">
        {page===0?
        <div>
        <button className="p-6" onClick={portraitView}>portrait</button>
        <button className="p-6" onClick={landscapeView}>landscape</button>
        </div>:
        <canvas id="canvas" className="row" />}
      </div>
      <div className="col-start-4 row-start-1 overflow-hidden">
        <ElementsPanel />
      </div>
      <div className="col-start-3 row-start-2 col-span-2 relative px-[10px] py-[4px] overflow-hidden">
        <TimeLine />
      </div>
    </div>
    </>
  );
});
