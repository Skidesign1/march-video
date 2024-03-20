"use client";
import Image  from "next/image";
import logo from '../../public/favicon.png'
import { fabric } from "fabric";
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from "react";
import { StoreContext } from "@/store";
import { Store } from "@/store/Store";
import { observer } from "mobx-react";
import { Resources } from "./Resources";
import { ElementsPanel } from "./panels/ElementsPanel";
import { Menu } from "./Menu";
import { TimeLine } from "./TimeLine";
import "@/utils/fabric-utils";
import axios from "axios";


export const EditorWithStore = () => {
  const [store] = useState(new Store());
  return (
    <StoreContext.Provider value={store}>
      <Editor></Editor>
    </StoreContext.Provider>
  );
}

export const Editor = observer(() => {
  const store = React.useContext(StoreContext);
  const params = useParams()
  let page = store.page
  let portrait=store.portrait
  const portraitView = ()=>{
    store.setPage(1)
    store.setPortrait(true)
  }

  const landscapeView = ()=>{
    store.setPage(1)
    store.setPortrait(false)
  }


  useEffect(() => {
    
    const canvas = portrait?new fabric.Canvas("canvas", {
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
    
  }, [portrait, page]);
  return (
    <>
    <div className="flex  justify-between items-center  gap-2 py-3 bg-slate-200">
      <img className="h-[40px] " src='/Logo.png' alt="logo" />
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
