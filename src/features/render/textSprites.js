// Cache glyphs, never positions: every frame still uses the object's exact projection.
export function createTextSpriteRenderer({ createCanvas = () => document.createElement('canvas'), maxEntries = 256 } = {}) {
  const cache = new Map();
  const properties = ['font','fillStyle','textAlign','textBaseline','direction',
    'fontKerning','fontStretch','fontVariantCaps','letterSpacing','wordSpacing'];
  function render(ctx,text,x,y) {
    if(typeof ctx.fillStyle !== 'string' || !Number.isFinite(x) || !Number.isFinite(y))return false;
    const key=JSON.stringify([text,...properties.map(p=>ctx[p])]);
    let item=cache.get(key);
    if(!item){
      const canvas=createCanvas(),ink=canvas.getContext('2d');
      if(!ink)return false;
      const copy=()=>{for(const p of properties)if(ctx[p]!==undefined)ink[p]=ctx[p]};
      copy();
      const m=ink.measureText(text);
      if(![m.actualBoundingBoxLeft,m.actualBoundingBoxRight,m.actualBoundingBoxAscent,m.actualBoundingBoxDescent].every(Number.isFinite))return false;
      const pad=3;
      const left=Math.max(0,Math.ceil(m.actualBoundingBoxLeft))+pad;
      const top=Math.max(0,Math.ceil(m.actualBoundingBoxAscent))+pad;
      const width=left+Math.max(0,Math.ceil(m.actualBoundingBoxRight))+pad;
      const height=top+Math.max(0,Math.ceil(m.actualBoundingBoxDescent))+pad;
      if(width>1024||height>256)return false;
      // Supersample glyphs so subpixel motion does not move a coarse row of ink
      // abruptly between neighbouring screen pixels. Never round the live anchor.
      const resolution=2;
      canvas.width=width*resolution;canvas.height=height*resolution;copy();
      ink.scale(resolution,resolution);
      ink.fillText(text,left,top);
      item={canvas,left,top,width,height};
      if(cache.size>=maxEntries)cache.delete(cache.keys().next().value);
      cache.set(key,item);
    }
    ctx.save();
    // Labels have no shadow. Keep live opacity and exact subpixel position.
    ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;
    ctx.imageSmoothingEnabled=true;
    ctx.drawImage(item.canvas,x-item.left,y-item.top,item.width,item.height);
    ctx.restore();
    return true;
  }
  render.clear=()=>cache.clear();
  return render;
}
