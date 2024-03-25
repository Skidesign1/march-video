import { makeAutoObservable } from 'mobx';
import { fabric } from 'fabric';
import { getUid, isHtmlAudioElement, isHtmlImageElement, isHtmlVideoElement } from '@/utils';
import anime, { get } from 'animejs';
import { PolygonPointsList, RedrawnShapeProperties, TemplateInfo, SharedShapeProperties, TextProperties, MenuOption, EditorElement, Animation, TimeFrame, VideoEditorElement, AudioEditorElement, Placement, ImageEditorElement, Effect, TextEditorElement } from '../types';
import { FabricUitls } from '@/utils/fabric-utils';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { Gradient, Polygon, Triangle } from 'fabric/fabric-impl';
import { Factory } from 'react';

export class Store {
  canvas: fabric.Canvas | null

  backgroundColor: string;
  templateInfo: TemplateInfo
  selectedMenuOption: MenuOption;
  audios: string[]
  videos: string[]
  images: string[]
  editorElements: EditorElement[]
  selectedElement: EditorElement | null;
  redrawnShapePoints:any;

  redrawnShapeProperties:RedrawnShapeProperties;

  fetchedTemplate:string;
  

  polygonData:PolygonPointsList;

  portrait:boolean;
  page:number;

  maxTime: number
  animations: Animation[]
  animationTimeLine: anime.AnimeTimelineInstance;
  playing: boolean;

  currentKeyFrame: number;
  fps: number;

  possibleVideoFormats: string[] = ['mp4', 'webm'];
  selectedVideoFormat: 'mp4' | 'webm';

  constructor() {
    this.canvas = null;
    this.videos = [];
    this.images = [];
    this.audios = [];
    this.templateInfo = {};
    this.editorElements = [];
    this.backgroundColor = 'white';
    this.maxTime = 30 * 1000;
    this.playing = false;
    this.page=0;
    this.fetchedTemplate=""
    this.redrawnShapePoints=[]
    this.redrawnShapeProperties={};
    this.portrait=false;
    this.currentKeyFrame = 0;
    this.selectedElement = null;

    this.polygonData={polygonPoints:[]}
    this.fps = 60;
    this.animations = [];
    this.animationTimeLine = anime.timeline();
    this.selectedMenuOption = 'Video';
    this.selectedVideoFormat = 'mp4';
    makeAutoObservable(this);
  }

  get currentTimeInMs() {
    return this.currentKeyFrame * 1000 / this.fps;
  }

  setCurrentTimeInMs(time: number) {
    this.currentKeyFrame = Math.floor(time / 1000 * this.fps);
  }

  setSelectedMenuOption(selectedMenuOption: MenuOption) {
    this.selectedMenuOption = selectedMenuOption;
  }

  setCanvas(canvas: fabric.Canvas | null) {
    this.canvas = canvas;
    if (canvas) {
      canvas.backgroundColor = this.backgroundColor;
    }
  }

  setPage(page:number){
    this.page=page
  }

  setPortrait(isPortrait:boolean){
    this.portrait=isPortrait
  }


  changeElementFill(color: string ) {
    if (this.selectedElement && typeof this.selectedElement === 'object' && 'fabricObject' in this.selectedElement) {
      const fabricObject = this.selectedElement.fabricObject
      if (fabricObject instanceof fabric.Object) {
        fabricObject.set('fill', color);
        console.log("setting fill ",color)
      }
      // this.refreshElements();
    }
  }


  setBackgroundColor(backgroundColor: string) {
    this.backgroundColor = backgroundColor;
    if (this.canvas) {
      this.canvas.backgroundColor = backgroundColor;
    }
  }

  updateEffect(id: string, effect: Effect) {
    const index = this.editorElements.findIndex((element) => element.id === id);
    const element = this.editorElements[index];
    if (isEditorVideoElement(element) || isEditorImageElement(element)) {
      element.properties.effect = effect;
    }
    this.refreshElements();
  }

  setVideos(videos: string[]) {
    this.videos = videos;
  }

  addVideoResource(video: string) {
    this.videos = [...this.videos, video];
  }
  addAudioResource(audio: string) {
    this.audios = [...this.audios, audio];
  }
  addImageResource(image: string) {
    this.images = [...this.images, image];
  }

  addAnimation(animation: Animation) {
    this.animations = [...this.animations, animation];
    this.refreshAnimations();
  }
  updateAnimation(id: string, animation: Animation) {
    const index = this.animations.findIndex((a) => a.id === id);
    this.animations[index] = animation;
    this.refreshAnimations();
  }

  refreshAnimations() {
    anime.remove(this.animationTimeLine);
    this.animationTimeLine = anime.timeline({
      duration: this.maxTime,
      autoplay: false,
    });
    for (let i = 0; i < this.animations.length; i++) {
      const animation = this.animations[i];
      const editorElement = this.editorElements.find((element) => element.id === animation.targetId);
      const fabricObject = editorElement?.fabricObject;
      if (!editorElement || !fabricObject) {
        continue;
      }
      fabricObject.clipPath = undefined;
      switch (animation.type) {
        case "fadeIn": {
          this.animationTimeLine.add({
            opacity: [0, 1],
            duration: animation.duration,
            targets: fabricObject,
            easing: 'linear',
          }, editorElement.timeFrame.start);
          break;
        }
        case "fadeOut": {
          this.animationTimeLine.add({
            opacity: [1, 0],
            duration: animation.duration,
            targets: fabricObject,
            easing: 'linear',
          }, editorElement.timeFrame.end - animation.duration);
          break
        }
        case "slideIn": {
          const direction = animation.properties.direction;
          const targetPosition = {
            left: editorElement.placement.x,
            top: editorElement.placement.y,
          }
          const startPosition = {
            left: (direction === "left" ? - editorElement.placement.width : direction === "right" ? this.canvas?.width : editorElement.placement.x),
            top: (direction === "top" ? - editorElement.placement.height : direction === "bottom" ? this.canvas?.height : editorElement.placement.y),
          }
          if (animation.properties.useClipPath) {
            const clipRectangle = FabricUitls.getClipMaskRect(editorElement, 50);
            fabricObject.set('clipPath', clipRectangle)
          }
          if (editorElement.type === "text" && animation.properties.textType === "character") {
            this.canvas?.remove(...editorElement.properties.splittedTexts)
            // @ts-ignore
            editorElement.properties.splittedTexts = getTextObjectsPartitionedByCharacters(editorElement.fabricObject, editorElement);
            editorElement.properties.splittedTexts.forEach((textObject) => {
              this.canvas!.add(textObject);
            })
            const duration = animation.duration / 2;
            const delay = duration / editorElement.properties.splittedTexts.length;
            for (let i = 0; i < editorElement.properties.splittedTexts.length; i++) {
              const splittedText = editorElement.properties.splittedTexts[i];
              const offset = {
                left: splittedText.left! - editorElement.placement.x,
                top: splittedText.top! - editorElement.placement.y
              }
              this.animationTimeLine.add({
                left: [startPosition.left! + offset.left, targetPosition.left + offset.left],
                top: [startPosition.top! + offset.top, targetPosition.top + offset.top],
                delay: i * delay,
                duration: duration,
                targets: splittedText,
              }, editorElement.timeFrame.start);
            }
            this.animationTimeLine.add({
              opacity: [1, 0],
              duration: 1,
              targets: fabricObject,
              easing: 'linear',
            }, editorElement.timeFrame.start);
            this.animationTimeLine.add({
              opacity: [0, 1],
              duration: 1,
              targets: fabricObject,
              easing: 'linear',
            }, editorElement.timeFrame.start + animation.duration);

            this.animationTimeLine.add({
              opacity: [0, 1],
              duration: 1,
              targets: editorElement.properties.splittedTexts,
              easing: 'linear',
            }, editorElement.timeFrame.start);
            this.animationTimeLine.add({
              opacity: [1, 0],
              duration: 1,
              targets: editorElement.properties.splittedTexts,
              easing: 'linear',
            }, editorElement.timeFrame.start + animation.duration);
          }
          this.animationTimeLine.add({
            left: [startPosition.left, targetPosition.left],
            top: [startPosition.top, targetPosition.top],
            duration: animation.duration,
            targets: fabricObject,
            easing: 'linear',
          }, editorElement.timeFrame.start);
          break
        }
        case "slideOut": {
          const direction = animation.properties.direction;
          const startPosition = {
            left: editorElement.placement.x,
            top: editorElement.placement.y,
          }
          const targetPosition = {
            left: (direction === "left" ? - editorElement.placement.width : direction === "right" ? this.canvas?.width : editorElement.placement.x),
            top: (direction === "top" ? -100 - editorElement.placement.height : direction === "bottom" ? this.canvas?.height : editorElement.placement.y),
          }
          if (animation.properties.useClipPath) {
            const clipRectangle = FabricUitls.getClipMaskRect(editorElement, 50);
            fabricObject.set('clipPath', clipRectangle)
          }
          this.animationTimeLine.add({
            left: [startPosition.left, targetPosition.left],
            top: [startPosition.top, targetPosition.top],
            duration: animation.duration,
            targets: fabricObject,
            easing: 'linear',
          }, editorElement.timeFrame.end - animation.duration);
          break
        }
        case "breathe": {
          const itsSlideInAnimation = this.animations.find((a) => a.targetId === animation.targetId && (a.type === "slideIn"));
          const itsSlideOutAnimation = this.animations.find((a) => a.targetId === animation.targetId && (a.type === "slideOut"));
          const timeEndOfSlideIn = itsSlideInAnimation ? editorElement.timeFrame.start + itsSlideInAnimation.duration : editorElement.timeFrame.start;
          const timeStartOfSlideOut = itsSlideOutAnimation ? editorElement.timeFrame.end - itsSlideOutAnimation.duration : editorElement.timeFrame.end;
          if (timeEndOfSlideIn > timeStartOfSlideOut) {
            continue;
          }
          const duration = timeStartOfSlideOut - timeEndOfSlideIn;
          const easeFactor = 4;
          const suitableTimeForHeartbeat = 1000 * 60 / 72 * easeFactor
          const upScale = 1.05;
          const currentScaleX = fabricObject.scaleX ?? 1;
          const currentScaleY = fabricObject.scaleY ?? 1;
          const finalScaleX = currentScaleX * upScale;
          const finalScaleY = currentScaleY * upScale;
          const totalHeartbeats = Math.floor(duration / suitableTimeForHeartbeat);
          if (totalHeartbeats < 1) {
            continue;
          }
          const keyframes = [];
          for (let i = 0; i < totalHeartbeats; i++) {
            keyframes.push({ scaleX: finalScaleX, scaleY: finalScaleY });
            keyframes.push({ scaleX: currentScaleX, scaleY: currentScaleY });
          }

          this.animationTimeLine.add({
            duration: duration,
            targets: fabricObject,
            keyframes,
            easing: 'linear',
            loop: true
          }, timeEndOfSlideIn);

          break
        }
      }
    }
  }

  removeAnimation(id: string) {
    this.animations = this.animations.filter(
      (animation) => animation.id !== id
    );
    this.refreshAnimations();
  }

  setSelectedElement(selectedElement: EditorElement | null) {
    this.selectedElement = selectedElement;
    if (this.canvas) {
      if (selectedElement?.fabricObject)
        this.canvas.setActiveObject(selectedElement.fabricObject);
      else
        this.canvas.discardActiveObject();
    }
  }
  updateSelectedElement() {
    this.selectedElement = this.editorElements.find((element) => element.id === this.selectedElement?.id) ?? null;
  }


  setFetchedTemplate(fetchedTemplate:string){
    if(fetchedTemplate){
      this.fetchedTemplate=fetchedTemplate
    }
  }

  redrawFetchedTemplate(fetchedTemplate:string){
    if(fetchedTemplate){
      const jsonData = JSON.parse(fetchedTemplate);
      
      if(this.page>0){
        const textObjects= jsonData.objects.filter((object:any)=>{
          return object.type==='textbox' 
        })
        const imageObjects= jsonData.objects.filter((object:any)=>{
          return object.type==='coverImage' 
        })
        const likelyShapes=["line","triangle", "rect" , 'circle' ,'polygon']
        
        const rectObjects= jsonData.objects.filter((object:any)=>{
          return likelyShapes.includes(object.type)
        })
        
        textObjects?.forEach((textObject:any)=>{
          this.addText({
              fill:textObject.fill,
              left:textObject.left,
              top:textObject.top,
              scaleX:textObject.scaleX,
              scaleY:textObject.scaleY,
              angle:textObject.angle,
              height:textObject.height,
              width:textObject.width,
              text: textObject.text,
              fontSize: textObject.fontSize,
              fontWeight: textObject.fontWeight,

            })
            // this.refreshElements(textObject.fill)
        })
        rectObjects?.forEach(({type,width,height,fill,stroke,strokeWidth,radius,scaleX,scaleY,angle,top,left,points}:any)=>{
          this.addShape({
            type,
            width,
            height,
            fill,
            stroke,
            strokeWidth,
            radius,
            scaleX,
            scaleY,
            angle,
            top,
            points,
            left
          })
        })
        let index=0
        imageObjects.forEach((imageObject:any)=>{
          const id = getUid();
          this.addEditorElement(

            {
              id,
              name: `Media(image) ${index + 1}`,
              type: "image",
              placement: {
                x: imageObject.left,
                y: imageObject.top,
                width: imageObject.width,
                height: imageObject.height,
                rotation: imageObject.angle,
                scaleX: imageObject.scaleX,
                scaleY: imageObject.scaleY,
              },
              timeFrame: {
                start: 0,
                end: this.maxTime,
              },
              properties: {
                elementId: `image-${id}`,
                src: imageObject.src,
                effect: {
                  type: "none",
                }
              },
            },
          );
          
        })
        
        console.log(jsonData.objects)
        console.log(imageObjects)
        
      }
  }
}

  setEditorElements(editorElements: EditorElement[]) {
    this.editorElements = editorElements;
    this.updateSelectedElement();
    // console.log(editorElements)
    //select element in focus
    const focusedElement = editorElements[editorElements.length-1] 
    // if(focusedElement.type==='text'){
    //   this.refreshElements("white");
    // }
    // else{
    //   this.refreshElements()
    // }
    // this.refreshAnimations();
  }

  updateEditorElement(editorElement: EditorElement) {
    this.setEditorElements(this.editorElements.map((element) =>
      element.id === editorElement.id ? editorElement : element
    ));
  }

  updateEditorElementTimeFrame(editorElement: EditorElement, timeFrame: Partial<TimeFrame>) {
    if (timeFrame.start != undefined && timeFrame.start < 0) {
      timeFrame.start = 0;
    }
    if (timeFrame.end != undefined && timeFrame.end > this.maxTime) {
      timeFrame.end = this.maxTime;
    }
    const newEditorElement = {
      ...editorElement,
      timeFrame: {
        ...editorElement.timeFrame,
        ...timeFrame,
      }
    }
    this.updateVideoElements();
    this.updateAudioElements();
    this.updateEditorElement(newEditorElement);
    this.refreshAnimations();
  }


  addEditorElement(editorElement: EditorElement) {
    this.setEditorElements([...this.editorElements, editorElement]);
    
    if(editorElement.type==='text'||"rect"){
      this.refreshElements(editorElement.placement.fill??"white");
      console.log("editor element colour is ", editorElement.placement.fill)
    }
    else{
      this.refreshElements()
    }
    this.setSelectedElement(this.editorElements[this.editorElements.length - 1]);
  }

  removeEditorElement(id: string) {
    this.setEditorElements(this.editorElements.filter(
      (editorElement) => editorElement.id !== id
    ));
    this.refreshElements();
  }

  setMaxTime(maxTime: number) {
    this.maxTime = maxTime;
  }


  setPlaying(playing: boolean) {
    this.playing = playing;
    this.updateVideoElements();
    this.updateAudioElements();
    if (playing) {
      this.startedTime = Date.now();
      this.startedTimePlay = this.currentTimeInMs
      requestAnimationFrame(() => {
        this.playFrames();
      });
    }
  }

  startedTime = 0;
  startedTimePlay = 0;

  playFrames() {
    if (!this.playing) {
      return;
    }
    const elapsedTime = Date.now() - this.startedTime;
    const newTime = this.startedTimePlay + elapsedTime;
    this.updateTimeTo(newTime);
    if (newTime > this.maxTime) {
      this.currentKeyFrame = 0;
      this.setPlaying(false);
    } else {
      requestAnimationFrame(() => {
        this.playFrames();
      });
    }
  }
  updateTimeTo(newTime: number) {
    this.setCurrentTimeInMs(newTime);
    this.animationTimeLine.seek(newTime);
    if (this.canvas) {
      this.canvas.backgroundColor = this.backgroundColor;
    }
    this.editorElements.forEach(
      e => {
        if (!e.fabricObject) return;
        const isInside = e.timeFrame.start <= newTime && newTime <= e.timeFrame.end;
        e.fabricObject.visible = isInside;
      }
    )
  }

  handleSeek(seek: number) {
    if (this.playing) {
      this.setPlaying(false);
    }
    this.updateTimeTo(seek);
    this.updateVideoElements();
    this.updateAudioElements();
  }

  addVideo(index: number) {
    const videoElement = document.getElementById(`video-${index}`)
    if (!isHtmlVideoElement(videoElement)) {
      return;
    }
    const videoDurationMs = videoElement.duration * 1000;
    const aspectRatio = videoElement.videoWidth / videoElement.videoHeight;
    const id = getUid();
    this.addEditorElement(
      {
        id,
        name: `Media(video) ${index + 1}`,
        type: "video",
        placement: {
          x: 0,
          y: 0,
          width: 100 * aspectRatio,
          height: 100,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
        },
        timeFrame: {
          start: 0,
          end: videoDurationMs,
        },
        properties: {
          elementId: `video-${id}`,
          src: videoElement.src,
          effect: {
            type: "none",
          }
        },
      },
    );
  }

  addImage(index: number) {
    const imageElement = document.getElementById(`image-${index}`)
    if (!isHtmlImageElement(imageElement)) {
      return;
    }
    const aspectRatio = imageElement.naturalWidth / imageElement.naturalHeight;
    const id = getUid();
    this.addEditorElement(
      {
        id,
        name: `Media(image) ${index + 1}`,
        type: "image",
        placement: {
          x: 0,
          y: 0,
          width: 100 * aspectRatio,
          height: 100,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
        },
        timeFrame: {
          start: 0,
          end: this.maxTime,
        },
        properties: {
          elementId: `image-${id}`,
          src: imageElement.src,
          effect: {
            type: "none",
          }
        },
      },
    );
  }

  addAudio(index: number) {
    const audioElement = document.getElementById(`audio-${index}`)
    if (!isHtmlAudioElement(audioElement)) {
      return;
    }
    const audioDurationMs = audioElement.duration * 1000;
    const id = getUid();
    this.addEditorElement(
      {
        id,
        name: `Media(audio) ${index + 1}`,
        type: "audio",
        placement: {
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
        },
        timeFrame: {
          start: 0,
          end: audioDurationMs,
        },
        properties: {
          elementId: `audio-${id}`,
          src: audioElement.src,
        }
      },
    );

  }
  addText(options: TextProperties) {
    
    const id = getUid();
    const index = this.editorElements.length;
    this.addEditorElement(
      {
        id,
        name: `Text ${index + 1}`,
        type: "text",
        placement: {
          x: options.left??0,
          y: options.top??0,
          width: options.width??100,
          height: options.height??100,
          rotation: options.angle?? 0,
          fill:options.fill??"#fffff",
          scaleX:options.scaleX??1,
          scaleY:options.scaleY??1,
        },
        timeFrame: {
          start: 0,
          end: this.maxTime,
        },
        properties: {
          text: options.text,
          fontSize: options.fontSize,
          fontWeight: options.fontWeight,
          splittedTexts: [],
        },
      },
    );
  }


  extractPolygonPoints(name:string){
    const filtered=JSON.parse(JSON.stringify(this.polygonData)).polygonPoints[0].filter((polygon:any)=>{
      return polygon.name===name
    })
    return filtered[0].dimensions
  }



  addShape(options: {
    type: 'rect' |"polygon"| 'circle' | 'triangle' | 'line' | 'octagon' | 'pentagon' | 'hexagon' | 'rhombus' | 'trapezoid' | 'parallelogram' | 'ellipse' | 'oval' | 'star' | 'heart',
    width: number,
    height: number,
    fill: string,
    stroke: string,
    strokeWidth: number,
    radius?:number,
    angle?:number,
    scaleX?:number,
    scaleY?:number,
    top?:number,
    left?:number,
    points?:[]
  }) {

    this.polygonData = {
      polygonPoints:[
        [
          {
          name:"pentagon",
          dimensions:[
          { x: 0, y: -50 },
          { x: 50, y: -20 },
          { x: 30, y: 40 },
          { x: -30, y: 40 },
          { x: -50, y: -20 }
          ]
        },
          {
          name:"hexagon",
          dimensions:[
            { x: 0, y: -50 },
            { x: 43.3, y: -25 },
            { x: 43.3, y: 25 },
            { x: 0, y: 50 },
            { x: -43.3, y: 25 },
            { x: -43.3, y: -25 }
          ]
        },
          {
          name:"parallelogram",
          dimensions:[
            { x: 0, y: -50 },
            { x: 80, y: -50 },
            { x: 50, y: 50 },
            { x: -30, y: 50 }
          ]
        },
          {
          name:"octagon",
          dimensions:[
            { x: 0, y: -50 },
            { x: 35.4, y: -35.4 },
            { x: 50, y: 0 },
            { x: 35.4, y: 35.4 },
            { x: 0, y: 50 },
            { x: -35.4, y: 35.4 },
            { x: -50, y: 0 },
            { x: -35.4, y: -35.4 }
          ]
        },
          {
          name:"trapezoid",
          dimensions:[
            { x: -40, y: -50 },
            { x: 40, y: -50 },
            { x: 30, y: 50 },
            { x: -30, y: 50 }
          ]
        },
          {
          name:"rhombus",
          dimensions:[            
              { x: 0, y: -50 },
              { x: 50, y: 0 },
              { x: 0, y: 50 },
              { x: -50, y: 0 }
          ]
        },
      ]]}
    const id = getUid();
    const index = this.editorElements.length;
    const canvas = document.getElementById("credrawnShapeColornvas") as HTMLCanvasElement;
    
    
    // this.redrawnShapeColor=options.fill
    this.redrawnShapeProperties.fill=options.fill
    this.redrawnShapeProperties.scaleX=options.scaleX
    this.redrawnShapeProperties.scaleY=options.scaleY
    this.redrawnShapeProperties.angle=options.angle
    this.redrawnShapeProperties.points=options.points
    this.redrawnShapePoints=options.points
    // console.log("options.points")
    // console.log(options.points)
    console.log(this.extractPolygonPoints('pentagon'))
    console.log(JSON.parse(JSON.stringify(this.polygonData)))

    let shape;
    const commonShapeProperties:SharedShapeProperties={
      left: 0,
      top: 0,
      fill: options.fill,
      scaleX:options.scaleX,
      scaleY:options.scaleY,
      angle:options.angle,
      stroke: options.stroke,
      strokeWidth: options.strokeWidth,
      width: options.width,
      height: options.height,
    }
    switch (options.type) {
      case 'rect':
        shape = new fabric.Rect(
          commonShapeProperties
        );
        break;
      case 'circle':
        shape = new fabric.Circle({
          ...commonShapeProperties,
          radius: options.radius,
        });
        break;
      case 'triangle':
        shape = new fabric.Triangle(
          commonShapeProperties,
        );
        break;
      case 'line':
        shape = new fabric.Line([50, 50, 250, 50],
          commonShapeProperties,
        );
        break;
      case 'octagon':
        shape = new fabric.Polygon(
          this.extractPolygonPoints('octagon'),
            commonShapeProperties,
           );
        break;
      case 'pentagon':
        shape = new fabric.Polygon(
          this.extractPolygonPoints('pentagon'),
          commonShapeProperties
          );
        break;
      case 'hexagon':
        shape = new fabric.Polygon(
          this.extractPolygonPoints('hexagon'),
          commonShapeProperties
          );
        break;
      case 'rhombus':
        shape = new fabric.Polygon(
          this.extractPolygonPoints('rhombus'),
          commonShapeProperties
            );
        break;
      case 'trapezoid':
        shape = new fabric.Polygon(
          this.extractPolygonPoints('trapezoid'),
          commonShapeProperties);
        break;
      case 'parallelogram':
        shape = new fabric.Polygon(
          this.extractPolygonPoints('parallelogram'),
          commonShapeProperties);
        break;
      case 'polygon':
        shape = new fabric.Polygon(
          this.redrawnShapeProperties.points,
          commonShapeProperties);
        break;
      case 'ellipse':
        shape = new fabric.Ellipse(
          {
            ...commonShapeProperties,
            rx: 50,
            ry: 25,
          });
        break;
      case 'oval':
        shape = new fabric.Ellipse(
          {
            ...commonShapeProperties,
            rx: 75,
            ry: 40,
          });
        break;
      case 'star':
        shape = new fabric.Path('M 100 0 L 125 50 L 200 50 L 150 90 L 175 150 L 100 120 L 25 150 L 50 90 L 0 50 L 75 50 Z',
          commonShapeProperties,
          );
        break;
      case 'heart':
        shape = new fabric.Path('M 100 0 A 20 20 0 0 1 100 40 A 20 20 0 0 1 100 80 Q 100 100 80 120 A 20 20 0 0 1 60 120 A 20 20 0 0 1 20 80 Q 0 60 0 40 A 20 20 0 0 1 20 0 Q 50 -20 100 0 Z',
          commonShapeProperties);
        break;

      default:
        throw new Error(`Unsupported shape type: ${options.type}`);
    }

    this.addEditorElement(
      {
        id,
        name: `${options.type.charAt(0).toUpperCase() + options.type.slice(1)} ${index + 1}`,
        type: options.type,
        placement: {
          x: options.left??0,
          y: options.top??0,
          width: options.width,
          height: options.height,
          rotation: options.angle??0,
          scaleX: options.scaleX??1,
          scaleY: options.scaleY??1,
        },
        timeFrame: {
          start: 0,
          end: this.maxTime,
        },
        properties: {
          fill: options.fill,
          width: options.width,
          height: options.height,
          radius: options.radius,
          strokeWidth: options.strokeWidth,
          stroke: options.stroke,
          points:options.points
        },
      },
    );
  }


  updateVideoElements() {
    this.editorElements.filter(
      (element): element is VideoEditorElement =>
        element.type === "video"
    )
      .forEach((element) => {
        const video = document.getElementById(element.properties.elementId);
        if (isHtmlVideoElement(video)) {
          const videoTime = (this.currentTimeInMs - element.timeFrame.start) / 1000;
          video.currentTime = videoTime;
          if (this.playing) {
            video.play();
          } else {
            video.pause();
          }
        }
      })
  }
  updateAudioElements() {
    this.editorElements.filter(
      (element): element is AudioEditorElement =>
        element.type === "audio"
    )
      .forEach((element) => {
        const audio = document.getElementById(element.properties.elementId);
        if (isHtmlAudioElement(audio)) {
          const audioTime = (this.currentTimeInMs - element.timeFrame.start) / 1000;
          audio.currentTime = audioTime;
          if (this.playing) {
            audio.play();
          } else {
            audio.pause();
          }
        }
      })
  }
  // saveCanvasToVideo() {
  //   const video = document.createElement("video");
  //   const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  //   const stream = canvas.captureStream();
  //   video.srcObject = stream;
  //   video.play();
  //   const mediaRecorder = new MediaRecorder(stream);
  //   const chunks: Blob[] = [];
  //   mediaRecorder.ondataavailable = function (e) {
  //     console.log("data available");
  //     console.log(e.data);
  //     chunks.push(e.data);
  //   };
  //   mediaRecorder.onstop = function (e) {
  //     const blob = new Blob(chunks, { type: "video/webm" });
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = "video.webm";
  //     a.click();
  //   };
  //   mediaRecorder.start();
  //   setTimeout(() => {
  //     mediaRecorder.stop();
  //   }, this.maxTime);

  // }

  setVideoFormat(format: 'mp4' | 'webm') {
    this.selectedVideoFormat = format;
  }

  saveCanvasToVideoWithAudio() {
    this.saveCanvasToVideoWithAudioWebmMp4();
  }

  saveCanvasToVideoWithAudioWebmMp4() {
    
    let mp4 = this.selectedVideoFormat === 'mp4'
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const stream = canvas.captureStream(30);
    const audioElements = this.editorElements.filter(isEditorAudioElement)
    const audioStreams: MediaStream[] = [];
    audioElements.forEach((audio) => {
      const audioElement = document.getElementById(audio.properties.elementId) as HTMLAudioElement;
      let ctx = new AudioContext();
      let sourceNode = ctx.createMediaElementSource(audioElement);
      let dest = ctx.createMediaStreamDestination();
      sourceNode.connect(dest);
      sourceNode.connect(ctx.destination);
      audioStreams.push(dest.stream);
    });
    audioStreams.forEach((audioStream) => {
      stream.addTrack(audioStream.getAudioTracks()[0]);
    });
    const video = document.createElement("video");
    video.srcObject = stream;
    video.height = 500;
    video.width = 800;
    // video.controls = true;
    // document.body.appendChild(video);
    video.play().then(() => {
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = function (e) {
        chunks.push(e.data);
        

      };
      mediaRecorder.onstop = async function (e) {
        const blob = new Blob(chunks, { type: "video/webm" });

        if (mp4) {
          // lets use ffmpeg to convert webm to mp4
          const data = new Uint8Array(await (blob).arrayBuffer());
          const ffmpeg = new FFmpeg();
          const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd"
          await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            // workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
          });
          await ffmpeg.writeFile('video.webm', data);
          await ffmpeg.exec(["-y", "-i", "video.webm", "-c", "copy", "video.mp4"]);
          // await ffmpeg.exec(["-y", "-i", "video.webm", "-c:v", "libx264", "video.mp4"]);

          const output = await ffmpeg.readFile('video.mp4');
          const outputBlob = new Blob([output], { type: "video/mp4" });
          const outputUrl = URL.createObjectURL(outputBlob);
          const a = document.createElement("a");
          a.download = "video.mp4";
          a.href = outputUrl;
          a.click();

        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "video.webm";
          a.click();
        }
      };
      mediaRecorder.start();
      setTimeout(() => {
        mediaRecorder.stop();
      }, this.maxTime);
      video.remove();
    })
  }


  async saveVideo() {

    const canvas = this.canvas;
    if (!canvas) return;
    const userId = window.sessionStorage.getItem("userId")
    const jsonData= {
      templateFile: JSON.stringify(canvas.toJSON([
        "transparentCorners",
        "cornerColor",
        "strokeWidth",
        "cornerStrokeColor",
        "borderColor",
        "cornerStyle",
        "name",
        "category",
        "level",
        "splitByGrapheme",
      ])),
      Name: this.templateInfo?.Name,
      Category: this.templateInfo?.Category,
      isPublished:  this.templateInfo?.isPublished,
      Platform: this.templateInfo?.Platform,
      Type: this.templateInfo?.Type,
      userId: userId
    };
    const templateId = window.sessionStorage.getItem("templateId")
    const token = window.sessionStorage.getItem("token")
    // Send JSON data to backend URL
    fetch(`https://skyestudio-backend.onrender.com/creatives/designs/${templateId}/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `${token}`,
      },
      body: JSON.stringify(jsonData),
    })
      .then(response => {
        if (response.ok) {
          console.log("Video sent successfully to backend");
          alert("Video saved successfully!");
        } else {
          console.error("Failed to send video to backend");
          alert("Error saving video.")
        }
      })
      .catch(error => {
        console.error("Error sending video to backend:", error);
        alert("Error saving video.")
      });
  };

  // createFabricShape(element, options) {
  //   const fabricObject = new options.fabricClass({
  //     name: element.id,
  //     left: element.placement.x,
  //     top: element.placement.y,
  //     scaleX: element.placement.scaleX,
  //     scaleY: element.placement.scaleY,
  //     angle: element.placement.rotation,
  //     ...options.additionalProps,
  //   });
  //   element.fabricObject = fabricObject;
  //   canvas.add(fabricObject);
  //   canvas.on("object:modified", function (e) {
  //     if (!e.target) return;
  //     const target = e.target;
  //     if (target !== fabricObject) return;
  //     const placement = element.placement;
  //     const newPlacement = {
  //       ...placement,
  //       x: target.left ?? placement.x,
  //       y: target.top ?? placement.y,
  //       rotation: target.angle ?? placement.rotation,
  //     };
  //     const newElement = {
  //       ...element,
  //       placement: newPlacement,
  //     };
  //     store?.updateEditorElement(newElement);
  //   });
  // }
  
  refreshShape(e:any,element:EditorElement,object:fabric.Object){
    
      if (!e.target) return;
      const target = e.target;
      if (target != object) return;
      const placement = element.placement;
      const newPlacement: Placement = {
        ...placement,
        x: target.left ?? placement.x,
        y: target.top ?? placement.y,
        rotation: target.angle ?? placement.rotation,
        width: target.width ?? placement.width,
        height: target.height ?? placement.height,
        scaleX: target.scaleX ?? placement.scaleX,
        scaleY: target.scaleY ?? placement.scaleY,
      };
      const newElement = {
        ...element,
        placement: newPlacement,
      };
      this.updateEditorElement(newElement);
    
  }


  refreshElements(currentColour?:(string | undefined)) {
    
    

    const store = this;
    if (!store.canvas) return;
    const canvas = store.canvas;
    store.canvas.remove(...store.canvas.getObjects());
    for (let index = 0; index < store.editorElements.length; index++) {
      const element = store.editorElements[index];
      // console.log("points is")
      
      // console.log(this.redrawnShapeProperties.points)
      const commonShapePropertiesForRefresh={
        name: element.id,
        left: element.placement.x,
        top: element.placement.y,
        scaleX: element.placement.scaleX,
        scaleY: element.placement.scaleY,
        angle: element.placement.rotation??this.redrawnShapeProperties.angle,
        fill: element.fabricObject?.fill??this.redrawnShapeProperties.fill??"grey",
        objectCaching: false,
        selectable: true,
        lockUniScaling: true,
      }
      switch (element.type) {
        case "video": {
          console.log("elementid", element.properties.elementId);
          if (document.getElementById(element.properties.elementId) == null)
            continue;
          const videoElement = document.getElementById(
            element.properties.elementId
          );
          if (!isHtmlVideoElement(videoElement)) continue;
          // const filters = [];
          // if (element.properties.effect?.type === "blackAndWhite") {
          //   filters.push(new fabric.Image.filters.Grayscale());
          // }
          const videoObject = new fabric.CoverVideo(videoElement, {
            name: element.id,
            left: element.placement.x,
            top: element.placement.y,
            width: element.placement.width,
            height: element.placement.height,
            scaleX: element.placement.scaleX,
            scaleY: element.placement.scaleY,
            angle: element.placement.rotation,
            objectCaching: false,
            selectable: true,
            lockUniScaling: true,
            // filters: filters,
            // @ts-ignore
            customFilter: element.properties.effect.type,
          });

          element.fabricObject = videoObject;
          element.properties.imageObject = videoObject;
          videoElement.width = 100;
          videoElement.height =
            (videoElement.videoHeight * 100) / videoElement.videoWidth;
          canvas.add(videoObject);
          canvas.on("object:modified", function (e) {
            if (!e.target) return;
            const target = e.target;
            if (target != videoObject) return;
            const placement = element.placement;
            const newPlacement: Placement = {
              ...placement,
              x: target.left ?? placement.x,
              y: target.top ?? placement.y,
              rotation: target.angle ?? placement.rotation,
              width:
                target.width && target.scaleX
                  ? target.width * target.scaleX
                  : placement.width,
              height:
                target.height && target.scaleY
                  ? target.height * target.scaleY
                  : placement.height,
              scaleX: 1,
              scaleY: 1,
            };
            const newElement = {
              ...element,
              placement: newPlacement,
            };
            store.updateEditorElement(newElement);
          });
          break;
        }
        case "image": {
          if (document.getElementById(element.properties.elementId) == null)
            continue;
          const imageElement = document.getElementById(
            element.properties.elementId
          );
          if (!isHtmlImageElement(imageElement)) continue;
          // const filters = [];
          // if (element.properties.effect?.type === "blackAndWhite") {
          //   filters.push(new fabric.Image.filters.Grayscale());
          // }
          
          const imageObject = new fabric.CoverImage(imageElement, {
            name: element.id,
            left: element.placement.x,
            top: element.placement.y,
            angle: element.placement.rotation,
            objectCaching: false,
            selectable: true,
            lockUniScaling: true,
            // filters
            // @ts-ignore
            customFilter: element.properties.effect.type,
          });
          // imageObject.applyFilters();
          element.fabricObject = imageObject;
          element.properties.imageObject = imageObject;
          const image = {
            w: imageElement.naturalWidth,
            h: imageElement.naturalHeight,
          };

          imageObject.width = image.w;
          imageObject.height = image.h;
          imageElement.width = image.w;
          imageElement.height = image.h;
          imageObject.scaleToHeight(image.w);
          imageObject.scaleToWidth(image.h);
          const toScale = {
            x: element.placement.width / image.w,
            y: element.placement.height / image.h,
          };
          imageObject.scaleX = toScale.x * element.placement.scaleX;
          imageObject.scaleY = toScale.y * element.placement.scaleY;
          canvas.add(imageObject);
          canvas.on("object:modified", function (e) {
            if (!e.target) return;
            const target = e.target;
            if (target != imageObject) return;
            const placement = element.placement;
            let fianlScale = 1;
            if (target.scaleX && target.scaleX > 0) {
              fianlScale = target.scaleX / toScale.x;
            }
            const newPlacement: Placement = {
              ...placement,
              x: target.left ?? placement.x,
              y: target.top ?? placement.y,
              rotation: target.angle ?? placement.rotation,
              scaleX: fianlScale,
              scaleY: fianlScale,
            };
            const newElement = {
              ...element,
              placement: newPlacement,
            };
            store.updateEditorElement(newElement);
          });
          break;
        }
        case "audio": {
          break;
        }
        case "text": {
          
        //   console.log(
        //   {event:"refreshing text"+","+element.properties.text+","+element.name,
        //   currentColour,
        //   inheritedColoor:element.fabricObject?.fill
        //   }
        //  )
          const textObject = new fabric.Textbox(element.properties.text, {
            name: element.id,
            left: element.placement.x,
            top: element.placement.y,
            scaleX: element.placement.scaleX,
            scaleY: element.placement.scaleY,
            width: element.placement.width,
            height: element.placement.height,
            angle: element.placement.rotation,
            fontSize: element.properties.fontSize,
            fontWeight: element.properties.fontWeight,
            objectCaching: false,
            selectable: true,
            lockUniScaling: true,
            fill: element.fabricObject?.fill??currentColour??'white',
          });
          element.fabricObject = textObject;
          canvas.add(textObject);
          // console.log("text-object",textObject)
          canvas.on("object:modified", function (e) {
            if (!e.target) return;
            const target = e.target;
            if (target != textObject) return;
            const placement = element.placement;
            const newPlacement: Placement = {
              ...placement,
              x: target.left ?? placement.x,
              y: target.top ?? placement.y,
              rotation: target.angle ?? placement.rotation,
              width: target.width ?? placement.width,
              height: target.height ?? placement.height,
              scaleX: target.scaleX ?? placement.scaleX,
              scaleY: target.scaleY ?? placement.scaleY,
            };
            const newElement = {
              ...element,
              placement: newPlacement,
              properties: {
                ...element.properties,
                // @ts-ignore
                text: target?.text,
              },
            };
            store.updateEditorElement(newElement);
          });
          break; 
        }
        case "rect": {
          
          const rectObject = new fabric.Rect({
            ...commonShapePropertiesForRefresh,
            width: element.properties.width,
            height: element.properties.height,
          });
          element.fabricObject = rectObject;
          canvas.add(rectObject);
          canvas.on("object:modified", function (e) {
            store.refreshShape(e,element,rectObject)
          });
          break;
        }
        case "circle": {
          const circleObject = new fabric.Circle({
            ...commonShapePropertiesForRefresh,
            radius:element.properties.radius,
        });
          element.fabricObject = circleObject;
          canvas.add(circleObject);
          canvas.on("object:modified", function (e) {
            store.refreshShape(e,element,circleObject)
         });
          break;
        }
        case "triangle": {
          const triangleObject = new fabric.Triangle({
            ...commonShapePropertiesForRefresh,
            width: element.properties.width,
            height: element.properties.height,
          });
          element.fabricObject = triangleObject;
          canvas.add(triangleObject);
          canvas.on("object:modified", function (e) {
            store.refreshShape(e,element,triangleObject)
         });
          break;
        }
        case "line": {
          const lineObject = new fabric.Line([50, 50, 250, 50], {
            ...commonShapePropertiesForRefresh,
            width: element.properties.width,
            height: element.properties.height,
          });
          element.fabricObject = lineObject;
          canvas.add(lineObject);
          canvas.on("object:modified", function (e) {
            store.refreshShape(e,element,lineObject)
         });
          break;
        }
        case "octagon": {
          const octObject = new fabric.Polygon(
            this.extractPolygonPoints('octagon'),
            {
              ...commonShapePropertiesForRefresh,
              width: element.properties.width,
              height: element.properties.height,
            });

          element.fabricObject = octObject;
          canvas.add(octObject);
          canvas.on("object:modified", function (e) {
            store.refreshShape(e,element,octObject)
         });
          break;
        }
        case "pentagon": {
          const pentObject = new fabric.Polygon(
            this.extractPolygonPoints('pentagon'),
            {
              ...commonShapePropertiesForRefresh,
              width: element.properties.width,
              height: element.properties.height,
            });
          element.fabricObject = pentObject;
          canvas.add(pentObject);
          canvas.on("object:modified", function (e) {
            store.refreshShape(e,element,pentObject)
         });
          break;
        }
        case "hexagon": {
          const hexObject = new fabric.Polygon(
            this.extractPolygonPoints('hexagon'),
            {
              ...commonShapePropertiesForRefresh,
              width: element.properties.width,
              height: element.properties.height,
            });
          element.fabricObject = hexObject;
          canvas.add(hexObject);
          canvas.on("object:modified", function (e) {
            store.refreshShape(e,element,hexObject)
         });
          break;
        }
        case "rhombus": {
          const rhoObject = new fabric.Polygon(
            this.extractPolygonPoints('rhombus'),
            {
              ...commonShapePropertiesForRefresh,
              width: element.properties.width,
              height: element.properties.height,
            });
          element.fabricObject = rhoObject;
          canvas.add(rhoObject);
          canvas.on("object:modified", function (e) {
            store.refreshShape(e,element,rhoObject)
         });
          break;
        }
        case "trapezoid": {
          const traObject = new fabric.Polygon(
            this.extractPolygonPoints('trapezoid'),
            {
              ...commonShapePropertiesForRefresh,
              width: element.properties.width,
              height: element.properties.height,
            });
          element.fabricObject = traObject;
          canvas.add(traObject);
          canvas.on("object:modified", function (e) {
            store.refreshShape(e,element,traObject)
         });
          break;
        }
        case "parallelogram": {
          const paraObject = new fabric.Polygon(
            this.extractPolygonPoints('parallelogram'),
            {
              ...commonShapePropertiesForRefresh,
              width: element.properties.width,
              height: element.properties.height,
            });
          element.fabricObject = paraObject;
          canvas.add(paraObject);
          canvas.on("object:modified", function (e) {
            store.refreshShape(e,element,paraObject)
         });
          break;
        }
        case "polygon": {
          // console.log(element)
          console.log("this.redrawnShapeProperties.points first member")
          console.log(JSON.parse(JSON.stringify(element.properties.points)))
          
          const redrawnPolygonObject = new fabric.Polygon(
            JSON.parse(JSON.stringify(element.properties.points)),
            {
              ...commonShapePropertiesForRefresh,
              width: element.properties.width,
              height: element.properties.height,
            });
          element.fabricObject = redrawnPolygonObject;
          canvas.add(redrawnPolygonObject);
          canvas.on("object:modified", function (e) {
            store.refreshShape(e,element,redrawnPolygonObject)
         });
          break;
        }
        case "ellipse": {
          const elipObject = new fabric.Ellipse(
            {
              ...commonShapePropertiesForRefresh,
              rx: 50,
              ry: 25,
              width: element.properties.width,
              height: element.properties.height,
            });
          element.fabricObject = elipObject;
          canvas.add(elipObject);
          canvas.on("object:modified", function (e) {
            store.refreshShape(e,element,elipObject)
         });
          break;
        }
        case "oval": {
          const ovaObject = new fabric.Ellipse(
            {
              ...commonShapePropertiesForRefresh,
              width: element.properties.width,
              height: element.properties.height,
              rx: 75,
              ry: 40,
            });
          element.fabricObject = ovaObject;
          canvas.add(ovaObject);
          canvas.on("object:modified", function (e) {
            store.refreshShape(e,element,ovaObject)
         });
          break;
        }
        case "star": {
          const starObject = new fabric.Path('M 100 0 L 125 50 L 200 50 L 150 90 L 175 150 L 100 120 L 25 150 L 50 90 L 0 50 L 75 50 Z',
            {
              ...commonShapePropertiesForRefresh,
              width: element.properties.width,
              height: element.properties.height,
            });
          element.fabricObject = starObject;
          canvas.add(starObject);
          canvas.on("object:modified", function (e) {
            store.refreshShape(e,element,starObject)
         });
          break;
        }
        case "heart": {
          const heartObject = new fabric.Path('M 100 0 A 20 20 0 0 1 100 40 A 20 20 0 0 1 100 80 Q 100 100 80 120 A 20 20 0 0 1 60 120 A 20 20 0 0 1 20 80 Q 0 60 0 40 A 20 20 0 0 1 20 0 Q 50 -20 100 0 Z',
            {
              ...commonShapePropertiesForRefresh,
              width: element.properties.width,
              height: element.properties.height,
            });
          element.fabricObject = heartObject;
          canvas.add(heartObject);
          canvas.on("object:modified", function (e) {
            store.refreshShape(e,element,heartObject)
         });
          break;
        }
        default: {
          throw new Error("Not implemented");
        }
      }
      if (element.fabricObject) {
        element.fabricObject.on("selected", function (e) {
          store.setSelectedElement(element);
        });
      }
    }
    const selectedEditorElement = store.selectedElement;
    if (selectedEditorElement && selectedEditorElement.fabricObject) {
      canvas.setActiveObject(selectedEditorElement.fabricObject);
    }
    this.refreshAnimations();
    this.updateTimeTo(this.currentTimeInMs);
    store.canvas.renderAll();
  }

}


export function isEditorAudioElement(
  element: EditorElement
): element is AudioEditorElement {
  return element.type === "audio";
}
export function isEditorVideoElement(
  element: EditorElement
): element is VideoEditorElement {
  return element.type === "video";
}

export function isEditorImageElement(
  element: EditorElement
): element is ImageEditorElement {
  return element.type === "image";
}


function getTextObjectsPartitionedByCharacters(textObject: fabric.Text, element: TextEditorElement): fabric.Text[] {
  let copyCharsObjects: fabric.Text[] = [];
  // replace all line endings with blank
  const characters = (textObject.text ?? "").split('').filter((m) => m !== '\n');
  const charObjects = textObject.__charBounds;
  if (!charObjects) return [];
  const charObjectFixed = charObjects.map((m, index) => m.slice(0, m.length - 1).map(m => ({ m, index }))).flat();
  const lineHeight = textObject.getHeightOfLine(0);
  for (let i = 0; i < characters.length; i++) {
    if (!charObjectFixed[i]) continue;
    const { m: charObject, index: lineIndex } = charObjectFixed[i];
    const char = characters[i];
    const scaleX = textObject.scaleX ?? 1;
    const scaleY = textObject.scaleY ?? 1;
    const charTextObject = new fabric.Text(char, {
      left: charObject.left * scaleX + (element.placement.x),
      scaleX: scaleX,
      scaleY: scaleY,
      top: lineIndex * lineHeight * scaleY + (element.placement.y),
      fontSize: textObject.fontSize,
      fontWeight: textObject.fontWeight,
      fill: '#fff',
    });
    copyCharsObjects.push(charTextObject);
  }
  return copyCharsObjects;
}