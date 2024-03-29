import { fabric } from "fabric";

export type EditorElementBase<T extends string, P> = {
  readonly id: string;
  fabricObject?: fabric.Object;
  name: string;
  readonly type: T;
  placement: Placement;
  timeFrame: TimeFrame;
  properties: P;
};
export type VideoEditorElement = EditorElementBase<
  "video",
  { src: string; elementId: string; imageObject?: fabric.Image, effect: Effect }
>;
export type ImageEditorElement = EditorElementBase<
  "image",
  { src: string; elementId: string; imageObject?: fabric.Object, effect: Effect }
>;

export type AudioEditorElement = EditorElementBase<
  "audio",
  { src: string; elementId: string }
>;
export type TextEditorElement = EditorElementBase<
  "text",
  {
    text: string;
    fontSize: number;
    fontWeight: number;
    splittedTexts: fabric.Text[];
  }
>;

export type ShapeEditorElement = EditorElementBase<
  "rect"  |"polygon" | 'circle' | 'triangle' | 'line' | 'octagon' | 'pentagon' | 'hexagon' | 'rhombus' | 'trapezoid' | 'parallelogram' | 'ellipse' | 'oval' | 'star' | 'heart',
  { 
    fill: string;
    width: number;
    height: number;
    radius?: number;
    strokeWidth: number;
    stroke: string;
    points?:any
   }
>;

export type EditorElement =
  | VideoEditorElement
  | ImageEditorElement
  | AudioEditorElement
  | ShapeEditorElement
  | TextEditorElement;

export type Placement = {
  x: number;
  y: number;
  fill?:string;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
};

export type TimeFrame = {
  start: number;
  end: number;
};

export type EffectBase<T extends string> = {
  type: T;
}

export type BlackAndWhiteEffect = EffectBase<"none"> | 
EffectBase<"blackAndWhite"> | 
EffectBase<"sepia"> | 
EffectBase<"invert"> |
EffectBase<"saturate"> ;
export type Effect = BlackAndWhiteEffect;
export type EffecType = Effect["type"];

export type AnimationBase<T, P = {}> = {
  id: string;
  targetId: string;
  duration: number;
  type: T;
  properties: P;
}

export type FadeInAnimation = AnimationBase<"fadeIn">;
export type FadeOutAnimation = AnimationBase<"fadeOut">;

export type BreatheAnimation = AnimationBase<"breathe">

export type SlideDirection = "left" | "right" | "top" | "bottom";
export type SlideTextType = 'none'|'character';
export type SlideInAnimation = AnimationBase<"slideIn", {
  direction: SlideDirection,
  useClipPath: boolean,
  textType:'none'|'character'
}>;

export type SlideOutAnimation = AnimationBase<"slideOut", {
  direction: SlideDirection,
  useClipPath: boolean,
  textType:SlideTextType,
}>;

export type Animation =
  FadeInAnimation
  | FadeOutAnimation
  | SlideInAnimation
  | SlideOutAnimation
  | BreatheAnimation;

export type MenuOption =
  | "Video"
  | "Audio"
  | "Text"
  | "Image"
  | "Export"
  | "Animation"
  | "Effect"
  | "Shapes"
  | "Colour"
  | "Fill";


  export interface TemplateInfo {
    Name?: string;
    Category?: string;
    isPublished?: boolean;
    Type?: string;
    Platform?: string;
  }

  export interface TextProperties {
    type?: string;
    text: string;
    left?: number;
    top?: number;
    originX?: string;
    originY?: string;
    width?: number;
    height?: number;
    scaleX?:number;
    scaleY?:number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    fontFamily?: string;
    fontSize: number;
    fontWeight: number;
    fontStyle?: string;
    textDecoration?: string;
    textAlign?: string;
    lineHeight?: number;
    charSpacing?: number;
    textBackgroundColor?: string;
    angle?: number;
    opacity?: number;
    shadow?: {
      color: string;
      blur: number;
      offsetX: number;
      offsetY: number;
    };
    visible?: boolean;
    selectable?: boolean;
    evented?: boolean;
    editable?: boolean;
  }
  

  export interface SharedShapeProperties{
      left?: number;
      top?: number;
      fill?: string;
      stroke?: string;
      strokeWidth?: number,
      width?:number,
      height?:number,
      scaleX?:number,
      scaleY?:number,
      angle?:number,
  }


  export interface RedrawnShapeProperties extends SharedShapeProperties{
    angle?:number;
    backgroundColor?:string;
    rx?:number;
    ry?:number
    scaleX?:number
    scaleY?:number
    type?:string
    points?:any
  }

  
  interface Dimension {
    x: number;
    y: number;
  }
  
  interface Polygon {
    name: string;
    dimensions: Dimension[];
  }
  
  

  export interface PolygonPointsList {
    polygonPoints: Polygon[][];
  }