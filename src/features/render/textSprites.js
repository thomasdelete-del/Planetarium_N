// Cache glyphs, never positions: every frame still uses the object's exact projection.
export function createTextSpriteRenderer({ createCanvas = () => document.createElement('canvas'), maxEntries = 256 } = {}) {
  const cache = new Map();
  const properties = ['font','fillStyle','textAlign','textBaseline','direction',
    'fontKerning','fontStretch','fontVariantCaps','letterSpacing','wordSpacing'];
  function render(ctx,text,x,y) {
    if(typeof ctx.fillStyle !== 'string' || !Number.isFinite(x) || !Number.isFinite(y))return false;
    // Largest singular value covers zoom, rotation, nonuniform scale and shear.
    // Translation never affects raster resolution or cache identity.
    const mtx=ctx.getTransform?.()||{a:1,b:0,c:0,d:1};
    const aa=mtx.a*mtx.a+mtx.b*mtx.b,bb=mtx.c*mtx.c+mtx.d*mtx.d;
    const ab=mtx.a*mtx.c+mtx.b*mtx.d;
    const scale=Math.sqrt((aa+bb+Math.hypot(aa-bb,2*ab))/2);
    if(!Number.isFinite(scale)||scale<=0)return false;
    const resolution=2*Math.max(1,scale);
    const key=JSON.stringify([text,resolution,...properties.map(p=>ctx[p])]);
    let item=cache.get(key);
    if(!item){
      const canvas=createCanvas(),ink=canvas.getContext('2d');
      if(!ink)return false;
      const copy=()=>{for(const p of properties)if(ctx[p]!==undefined)ink[p]=ctx[p]};
      copy();
      const m=ink.measureText(text);
      if(![m.actualBoundingBoxLeft,m.actualBoundingBoxRight,m.actualBoundingBoxAscent,m.actualBoundingBoxDescent].every(Number.isFinite))return false;
      const pad=3/resolution;
      const left=Math.max(0,Math.ceil(m.actualBoundingBoxLeft*resolution)/resolution)+pad;
      const top=Math.max(0,Math.ceil(m.actualBoundingBoxAscent*resolution)/resolution)+pad;
      const pixelWidth=Math.ceil((left+Math.max(0,m.actualBoundingBoxRight)+pad)*resolution);
      const pixelHeight=Math.ceil((top+Math.max(0,m.actualBoundingBoxDescent)+pad)*resolution);
      // Use native text rather than allocate an oversized bitmap or blur it.
      if(pixelWidth>2048||pixelHeight>512)return false;
      const width=pixelWidth/resolution,height=pixelHeight/resolution;
      // Supersample glyphs so subpixel motion does not move a coarse row of ink
      // abruptly between neighbouring screen pixels. Never round the live anchor.
      canvas.width=pixelWidth;canvas.height=pixelHeight;copy();
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
