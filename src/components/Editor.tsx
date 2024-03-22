
"use client";
import Image from "next/image";
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
  const params = useParams()
  useEffect(() => {
    
    const fetchTemplateInfo = async () => {
      try {
        
          const token = window.sessionStorage.getItem('token');
            
          // Check if token exists
          if (!token) {
          // Handle case where token is not available
          console.error('Token not found in session.');
            return;
          } 
        const config = {
          headers: {
          Authorization: `${token}`,
          },
        };
        // Fetch JSON from the database
        const response = await axios.get(`https://skyestudio-backend.onrender.com/templates/${params.templateId}`, config);
        const jsonData = response.data.data.templateFile;

        // Set the fetched JSON data in the store
        store.setFetchedTemplate(jsonData);
      } catch (error) {
        console.error('Error fetching template info:', error);
      }
    };

    // Fetch template info only when templateId changes
    if (params.templateId) {
      fetchTemplateInfo();
    }
  }, [params.templateId]);

  return (
    <StoreContext.Provider value={store}>
      <Editor />
    </StoreContext.Provider>
  );
}

export const Editor = observer(() => {
  const store = React.useContext(StoreContext);
  const params = useParams();
  const fetchedTemplate = store.fetchedTemplate; // Access fetched template from store

  const portraitView = () => {
    store.setPage(1)
    store.setPortrait(true)
  }

  const landscapeView = () => {
    store.setPage(1)
    store.setPortrait(false)
  }

  useEffect(() => {
    // Load canvas from fetched template only when it's available
    if (fetchedTemplate) {
      // store.setPage(1)
      store?.canvas?.loadFromJSON(fetchedTemplate, function() {
        store?.canvas?.renderAll();
      });
    }
  }, [fetchedTemplate]);

  

  useEffect(() => {
    const canvas = store.portrait ? new fabric.Canvas("canvas", {
      height: 500,
      width: 400,
      backgroundColor: "white",
    }) : new fabric.Canvas("canvas", {
      height: 500,
      width: 800,
      backgroundColor: "white",
    })

    fabric.Object.prototype.transparentCorners = false;
    fabric.Object.prototype.cornerColor = "#00a0f5";
    fabric.Object.prototype.cornerStyle = "circle";
    fabric.Object.prototype.cornerStrokeColor = "#0063d8";
    fabric.Object.prototype.cornerSize = 10;

    // canvas mouse down without target should deselect active object
    canvas.on("mouse:down", function(e) {
      if (!e.target) {
        store.setSelectedElement(null);
      }
    });

    store.setCanvas(canvas);
    fabric.util.requestAnimFrame(function render() {
      console.log('local rendering')
      canvas.renderAll();
      fabric.util.requestAnimFrame(render);
    });

    const redrawTemplateInfo = async () => {
      try {
          store.redrawFetchedTemplate(fetchedTemplate)
          // canvas.loadFromJSON(fetchedTemplate, function() {
          //   canvas.renderAll();
          //   store.setCanvas(canvas);
          //   // if(store.page>0){
          //   //   store.addText({text:"testing",fontSize:24,fontWeight:400})
          //   // }
          // });
      } catch (error) {
        console.error('Error fetching template info:', error);
      }
    };
    if (params.templateId) {
      redrawTemplateInfo();
    }
    return
  }, [store.portrait, store.page]);

  return (
    <>
      <div className="flex  justify-between items-center  gap-2 py-3 bg-slate-200">
        <img className="h-[40px] " src='/Logo.png' alt="logo" />
        <button className="bg-purple-400 text-white p-4 cursor-pointer" onClick={() => store?.saveVideo()}>Save Video</button>
        <button className="bg-purple-400 text-white p-4 cursor-pointer" onClick={() => store.addText({text:"testing",fontSize:24,fontWeight:400})}>text</button>
      </div>
      <div className="grid grid-rows-[500px_1fr_20px] grid-cols-[72px_300px_1fr_250px] ">
        <div className="tile row-span-2 flex flex-col bg-slate-200">
          <Menu />
        </div>
        <div className="row-span-2 flex flex-col overflow-hidden">
          <Resources />
        </div>
        <div id="grid-canvas-container" className="col-start-3 bg-slate-200 flex justify-center items-center">
          {store.page === 0 ?
            <div>
              <button className="p-6" onClick={portraitView}>portrait</button>
              <button className="p-6" onClick={landscapeView}>landscape</button>
            </div> :
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
