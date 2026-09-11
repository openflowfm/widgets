import { spectralPainter, type SpectralEnergy, type SpectralStyle } from '../theme/spectral.ts';
import { pathOf, type Edges } from './outline.ts';

/** Optional presentation of measured frequencies; geometry remains the standard outline. */
export interface SpectralOutlineStyle {
  layout:'layers'|'blend';
  spectral:SpectralStyle;
  weights:SpectralEnergy;
  /** White edge opacity; the one-pixel stroke stays inside the silhouette. */
  edge:number;
}
export function weightedEnergy(energy:SpectralEnergy,weights:SpectralEnergy):SpectralEnergy {
  return energy.map((e,i)=>Math.max(0,e)*Math.max(0,weights[i])) as unknown as SpectralEnergy;
}
export function layerRatios(energy:SpectralEnergy,weights:SpectralEnergy):SpectralEnergy {
  const values=weightedEnergy(energy,weights),sum=values.reduce((a,b)=>a+b,0);
  return sum?[values[0]/sum,(values[0]+values[1])/sum,1]:[0,0,0];
}
export interface SpectralOutlineAsk {
  width:number;height:number;from:number;to:number;smooth:number;
  neutral:string;silence:string;
}
/** Shared by Waveform and canvas hosts. Spectrum evenly covers the same source as edges. */
export function paintSpectralOutline(g:CanvasRenderingContext2D,edges:Edges,spectrum:readonly SpectralEnergy[],ask:SpectralOutlineAsk,style:SpectralOutlineStyle){
  const {width,height,from,to,smooth}=ask;
  if(!spectrum.length||!(to>from)||!(width>0)||!edges.points)return;
  const at=(x:number)=>spectrum[Math.max(0,Math.min(spectrum.length-1,Math.floor((from+x/width*(to-from))*spectrum.length)))];
  const shape=pathOf(edges,smooth),middle=height/2;
  const first=Math.max(0,Math.floor(from*spectrum.length)),last=Math.min(spectrum.length,Math.ceil(to*spectrum.length));
  g.save();
  // Do not bridge measured silence, even when cubic tangents cross neighboring bins.
  g.beginPath();
  for(let i=first;i<last;i++)if(spectrum[i].some(e=>e>0)){
    const x=(i/spectrum.length-from)/(to-from)*width;
    g.rect(x,0,width/(spectrum.length*(to-from)),height);
  }
  g.clip();g.clip(shape);
  if(style.layout==='blend'){
    const paint=spectralPainter(style.spectral,ask.neutral,ask.silence),gradient=g.createLinearGradient(0,0,width,0);
    for(let i=first;i<last;i++)gradient.addColorStop(Math.max(0,Math.min(1,((i+.5)/spectrum.length-from)/(to-from))),paint(weightedEnergy(spectrum[i],style.weights)));
    g.fillStyle=gradient;g.fillRect(0,0,width,height);
  }else{
    const colors=[style.spectral.colors.low,style.spectral.colors.mid,style.spectral.colors.high];
    for(let band=2;band>=0;band--){
      const scale=(ys:Float32Array,xs:Float32Array)=>Float32Array.from(ys,(y,i)=>middle+(y-middle)*layerRatios(at(xs[i]),style.weights)[band]);
      const nested=band===2?shape:pathOf({...edges,topY:scale(edges.topY,edges.topX),lowY:scale(edges.lowY,edges.lowX)},smooth);
      const t=colors[band];g.fillStyle=`hsl(${t.h} ${t.s}% ${t.l}%)`;g.fill(nested);
    }
    g.globalAlpha=1-style.spectral.strength/100;g.fillStyle=ask.neutral;g.fill(shape);g.globalAlpha=1;
  }
  g.strokeStyle=`rgba(255,255,255,${Math.max(0,Math.min(1,style.edge))})`;g.lineWidth=1;g.stroke(shape);g.restore();
}
