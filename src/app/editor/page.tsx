// export default function Home() {
//   return (
//     <main className="flex min-h-screen flex-col items-center justify-between p-24">
//       <a
//         href="/editor"
//         className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
//         rel="noopener noreferrer"
//       >
//         <h2 className={`mb-3 text-2xl font-semibold`}>
//           Go To Editor{" "}
//           <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
//             -&gt;
//           </span>
//         </h2>
       
//       </a>
//     </main>
//   );
// }



// 'use client';

// import dynamic from 'next/dynamic'

// const DynmicEditor = dynamic(() => import('../../components/Editor').then(a => a.EditorWithStore), {
//   ssr: false,
// })


// function EditorPage() {
//   return (
//     <DynmicEditor />
//   );
// }

// EditorPage.diplsayName = "EditorPage";

// export default EditorPage;

'use client'


import { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

// Manually paste the JSON data here
// const jsonData = {"version":"5.3.0","objects":[{"type":"textbox","version":"5.3.0","originX":"left","originY":"top","left":223,"top":189,"width":107.34,"height":31.64,"fill":"#ffffff","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":3.25,"scaleY":3.25,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"fontFamily":"Times New Roman","fontWeight":600,"fontSize":28,"text":"Headline","underline":false,"overline":false,"linethrough":false,"textAlign":"left","fontStyle":"normal","lineHeight":1.16,"textBackgroundColor":"","charSpacing":0,"styles":[],"direction":"ltr","path":null,"pathStartOffset":0,"pathSide":"left","pathAlign":"baseline","minWidth":20,"splitByGrapheme":false,"transparentCorners":false,"cornerColor":"#00a0f5","cornerStrokeColor":"#0063d8","borderColor":"rgb(178,204,255)","cornerStyle":"circle","name":"bbukdon"}],"background":"#111111"}
// const jsonData = {"version":"5.3.0","objects":[{"type":"coverVideo","version":"5.3.0","originX":"left","originY":"top","left":87,"top":116,"width":177.78,"height":100,"fill":"rgb(0,0,0)","stroke":null,"strokeWidth":0,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"cropX":0,"cropY":0,"transparentCorners":false,"cornerColor":"#00a0f5","cornerStrokeColor":"#0063d8","borderColor":"rgb(178,204,255)","cornerStyle":"circle","name":"ll6eap2","src":"blob:https://joyful-gnome-0be68c.netlify.app/1a305356-52e4-497f-9ae1-ac84409145f9","crossOrigin":null,"filters":[]},{"type":"textbox","version":"5.3.0","originX":"left","originY":"top","left":174,"top":50,"width":107.34,"height":31.64,"fill":"#ffffff","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"fontFamily":"Times New Roman","fontWeight":600,"fontSize":28,"text":"gory","underline":false,"overline":false,"linethrough":false,"textAlign":"left","fontStyle":"normal","lineHeight":1.16,"textBackgroundColor":"","charSpacing":0,"styles":[],"direction":"ltr","path":null,"pathStartOffset":0,"pathSide":"left","pathAlign":"baseline","minWidth":20,"splitByGrapheme":false,"transparentCorners":false,"cornerColor":"#00a0f5","cornerStrokeColor":"#0063d8","borderColor":"rgb(178,204,255)","cornerStyle":"circle","name":"35jl0tu"},{"type":"coverVideo","version":"5.3.0","originX":"left","originY":"top","left":406,"top":146,"width":177.78,"height":100,"fill":"rgb(0,0,0)","stroke":null,"strokeWidth":0,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"cropX":0,"cropY":0,"transparentCorners":false,"cornerColor":"#00a0f5","cornerStrokeColor":"#0063d8","borderColor":"rgb(178,204,255)","cornerStyle":"circle","name":"qz4qro2","src":"blob:https://joyful-gnome-0be68c.netlify.app/60529a68-5fc9-4965-8036-be4c2b4400b9","crossOrigin":null,"filters":[]},{"type":"coverImage","version":"5.3.0","originX":"left","originY":"top","left":226,"top":301.17,"width":1080,"height":638,"fill":"rgb(0,0,0)","stroke":null,"strokeWidth":0,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":0.23,"scaleY":0.23,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"cropX":0,"cropY":0,"transparentCorners":false,"cornerColor":"#00a0f5","cornerStrokeColor":"#0063d8","borderColor":"rgb(178,204,255)","cornerStyle":"circle","name":"k91fawn","src":"blob:https://joyful-gnome-0be68c.netlify.app/768872dd-cbde-4402-947f-4cfc8f5b0095","crossOrigin":null,"filters":[{"type":"Grayscale","mode":"average"}]}],"background":"#111111"}
// const jsonData = {"version":"5.3.0","objects":[{"type":"coverVideo","version":"5.3.0","originX":"left","originY":"top","left":87,"top":116,"width":177.78,"height":100,"fill":"rgb(0,0,0)","stroke":null,"strokeWidth":0,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"cropX":0,"cropY":0,"transparentCorners":false,"cornerColor":"#00a0f5","cornerStrokeColor":"#0063d8","borderColor":"rgb(178,204,255)","cornerStyle":"circle","name":"ll6eap2","src":"blob:https://joyful-gnome-0be68c.netlify.app/1a305356-52e4-497f-9ae1-ac84409145f9","crossOrigin":null,"filters":[]}],"background":"#111111"}
const jsonData = {"version":"5.3.0","objects":[{"type":"textbox","version":"5.3.0","originX":"left","originY":"top","left":178,"top":118,"width":100,"height":31.64,"fill":"#5a6d5aff","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"fontFamily":"Times New Roman","fontWeight":600,"fontSize":28,"text":"Title","underline":false,"overline":false,"linethrough":false,"textAlign":"left","fontStyle":"normal","lineHeight":1.16,"textBackgroundColor":"","charSpacing":0,"styles":[],"direction":"ltr","path":null,"pathStartOffset":0,"pathSide":"left","pathAlign":"baseline","minWidth":20,"splitByGrapheme":false,"transparentCorners":false,"cornerColor":"#00a0f5","cornerStrokeColor":"#0063d8","borderColor":"rgb(178,204,255)","cornerStyle":"circle","name":"h6c4429"},{"type":"textbox","version":"5.3.0","originX":"left","originY":"top","left":183,"top":154,"width":100,"height":15.82,"fill":"white","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"fontFamily":"Times New Roman","fontWeight":400,"fontSize":14,"text":"Call to Action","underline":false,"overline":false,"linethrough":false,"textAlign":"left","fontStyle":"normal","lineHeight":1.16,"textBackgroundColor":"","charSpacing":0,"styles":[],"direction":"ltr","path":null,"pathStartOffset":0,"pathSide":"left","pathAlign":"baseline","minWidth":20,"splitByGrapheme":false,"transparentCorners":false,"cornerColor":"#00a0f5","cornerStrokeColor":"#0063d8","borderColor":"rgb(178,204,255)","cornerStyle":"circle","name":"tt9u42q"}],"background":"#111111"}

export default function Home() {

  const canvasRef = useRef(null);


  useEffect(() => {
    // Load JSON into Fabric.js Canvas
    const canvas = new fabric.Canvas(canvasRef.current,{
      width:800,
      height:800
    });

    canvas.loadFromJSON(jsonData, function() {
      canvas.renderAll();
    });
  }, []);

  return (
    <div className='bg-white h-36 w-36 '>
        cnvs here
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}


// "use client"
// import React from "react";
// import { useParams } from 'next/navigation'
// import { useSearchParams } from 'next/navigation'
// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { StoreProvider } from "@/store";
// import { StoreContext } from "@/store";
// import { Editor } from "../../../components/Editor";


// function EditorPage() {
//   const store = React.useContext(StoreContext);

//   const params = useParams<{ templateId: string }>()
//   const searchParams = useSearchParams()
//   const userId = searchParams.get('userId')
//   const token = searchParams.get('token')
//   if (token) {
//     window.sessionStorage.setItem('token', token);
//   }
//   if (userId) {
//     window.sessionStorage.setItem('userId', userId);
//   }
//   if (params.templateId) {
//     window.sessionStorage.setItem('templateId', params.templateId);
//   }

//   useEffect(() => {
//     const fetchTemplateInfo = async () => {
//       try {

//         const token = window.sessionStorage.getItem('token');

//         // Check if token exists
//         if (!token) {
//           // Handle case where token is not available
//           console.error('Token not found in session.');
//           return;
//         }

//         // Define request headers with Authorization header containing the token
//         const config = {
//           headers: {
//             Authorization: `${token}`,
//           },
//         };
//         // Make a POST request to fetch template info using the provided id
//         const response = await axios.get(`https://skyestudio-backend.onrender.com/templates/${params.templateId}`, config);
//         console.log(response)
//         store?.setTemplateInfo(response.data);
//       } catch (error) {
//         console.error('Error fetching template info:', error);
//       }
//     };

//     const userId = window.sessionStorage.getItem('userId');
//     const fetchUserInfo = async () => {
//       try {
//         const token = window.sessionStorage.getItem('token');

//         // Check if token exists
//         if (!token) {
//           // Handle case where token is not available
//           console.error('Token not found in session.');
//           return;
//         }

//         // Define request headers with Authorization header containing the token
//         const config = {
//           headers: {
//             Authorization: `${token}`,
//           },
//         };

//         // Make a POST request to fetch user info using the provided id
//         const response = await axios.get(`https://skyestudio-backend.onrender.com/user/profile`, config);
//         console.log(response)
//         store?.setUserInfo(response.data);
//       } catch (error) {
//         console.error('Error fetching user info:', error);
//       }
//     };

//     if (params.templateId) {
//       fetchTemplateInfo();
//     }

//     if (userId) {
//       fetchUserInfo();
//     }
//   }, [params.templateId, userId]);

//   return (
//     userId &&
//     <StoreProvider>
//       <p className=" ml-5"><img src="/favicon.png" className="h-[40px] w-[40px] ml-5 mt-5" /> Skye Studio</p>
//       <Editor />
//     </StoreProvider>
//   );
// }



// export default EditorPage;

