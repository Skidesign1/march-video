"use client";
import Image  from "next/image";
import logo from '../../public/favicon.png'
import { fabric } from "fabric";
import React, { useEffect, useState } from "react";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import { Resources } from "./Resources";
import { ElementsPanel } from "./panels/ElementsPanel";
import { Menu } from "./Menu";
import { TimeLine } from "./TimeLine";
import { Store } from "@/store/Store";
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
  const[portrait, setPortrait]=useState(false)
  const store = React.useContext(StoreContext);

  const toggle = ()=>{
    setPortrait(!portrait)
  }


  useEffect(() => {
    const canvas = new fabric.Canvas("canvas", {
      height: 500,
      width:portrait?400:800,
      backgroundColor: "#ededed",
    });
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
    
    canvas.on("object:modified",function name(options) {
      console.log(options)
      let obj=options.target
      if(obj instanceof fabric.Text){
        obj.set('fill',obj.fill)
        // obj.set('fill','yellow')
        console.log(obj.fill)
        // store.refreshElements(obj.fill?.toString())
      }
    })

    store.setCanvas(canvas);
    fabric.util.requestAnimFrame(function render() {
      // console.log("fbric rerendering")
      canvas.renderAll();
      fabric.util.requestAnimFrame(render);
    });
  }, [portrait]);
  return (
    <>
    <div className="flex  justify-between items-center  gap-2 py-3 bg-slate-200">
      <img className="h-[40px] " src='Logo.png' alt="logo" />
      <button onClick={toggle}>{portrait?'Port':'lndscpe'}</button>
    </div>
      <div className="grid grid-rows-[500px_1fr_20px] grid-cols-[72px_300px_1fr_250px] ">
      <div className="tile row-span-2 flex flex-col bg-slate-200">
        <Menu />
      </div>
      <div className="row-span-2 flex flex-col overflow-hidden">
        <Resources />
      </div>
      <div id="grid-canvas-container" className="col-start-3 bg-slate-200 flex justify-center items-center">
        <canvas id="canvas" className="h-[500px] w-[800px] row" />
      </div>
      <div className="col-start-4 row-start-1 overflow-hidden">
        <ElementsPanel />
      </div>
      <div className="col-start-3 row-start-2 col-span-2 relative px-[10px] py-[4px] overflow-hidden">
        <TimeLine />
      </div>
      {/* <div className="col-span-4 text-right px-2 text-[0.5em] bg-black text-white">
        Crafted By Amit Digga
      </div> */}
    </div>
    </>

  );
});
