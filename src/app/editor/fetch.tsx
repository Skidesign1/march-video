// pages/index.js

import { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

// Manually paste the JSON data here
const jsonData = {"version":"5.3.0","objects":[{"type":"textbox","version":"5.3.0","originX":"left","originY":"top","left":178,"top":118,"width":100,"height":31.64,"fill":"#5a6d5aff","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"fontFamily":"Times New Roman","fontWeight":600,"fontSize":28,"text":"Title","underline":false,"overline":false,"linethrough":false,"textAlign":"left","fontStyle":"normal","lineHeight":1.16,"textBackgroundColor":"","charSpacing":0,"styles":[],"direction":"ltr","path":null,"pathStartOffset":0,"pathSide":"left","pathAlign":"baseline","minWidth":20,"splitByGrapheme":false,"transparentCorners":false,"cornerColor":"#00a0f5","cornerStrokeColor":"#0063d8","borderColor":"rgb(178,204,255)","cornerStyle":"circle","name":"h6c4429"},{"type":"textbox","version":"5.3.0","originX":"left","originY":"top","left":183,"top":154,"width":100,"height":15.82,"fill":"white","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"fontFamily":"Times New Roman","fontWeight":400,"fontSize":14,"text":"Call to Action","underline":false,"overline":false,"linethrough":false,"textAlign":"left","fontStyle":"normal","lineHeight":1.16,"textBackgroundColor":"","charSpacing":0,"styles":[],"direction":"ltr","path":null,"pathStartOffset":0,"pathSide":"left","pathAlign":"baseline","minWidth":20,"splitByGrapheme":false,"transparentCorners":false,"cornerColor":"#00a0f5","cornerStrokeColor":"#0063d8","borderColor":"rgb(178,204,255)","cornerStyle":"circle","name":"tt9u42q"}],"background":"#111111"}
export default function Home() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Load JSON into Fabric.js Canvas
    const canvas = new fabric.Canvas(canvasRef.current);

    canvas.loadFromJSON(jsonData, function() {
      canvas.renderAll();
    });
  }, []);

  return (
    <div className='bg-white h-36 w-36 '>
        new cnvs here
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
