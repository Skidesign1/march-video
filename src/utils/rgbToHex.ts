type Rgb = {
    r:number,
    g:number,
    b:number,
    a:number
    
}

export function rgbaToHex(rgbColor:Rgb) {
    
    
    
    
    rgbColor.r = Math.round(rgbColor.r);
    rgbColor.g = Math.round(rgbColor.g);
    rgbColor.b = Math.round(rgbColor.b);
    rgbColor.a = Math.round(rgbColor.a * 255);
    
    var alphaHex = rgbColor.a.toString(16).padStart(2, '0');
    var redHex = rgbColor.b.toString(16).padStart(2, '0');
    var greenHex = rgbColor.g.toString(16).padStart(2, '0');
    var blueHex = rgbColor.b.toString(16).padStart(2, '0');
    
    return '#' + redHex + greenHex + blueHex + alphaHex;
}

// Example usage:
// var rgbaColor = {r: 255, g: 100, b: 0, a: 0.5};
// var hexColor = rgbaToHex(rgbaColor.r, rgbaColor.g, rgbaColor.b, rgbaColor.a);
// console.log(hexColor); // Output: #ff640080
