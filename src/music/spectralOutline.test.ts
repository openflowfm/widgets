import { spectralPainter } from '../theme/spectral.ts';
import { describe,it,expect } from 'vitest';
import { layerRatios, weightedEnergy } from './spectralOutline.ts';
describe('spectral layer proportions',()=>{
  it('keeps silence empty and bounds nested layers to the measured envelope',()=>{
    expect(layerRatios([0,0,0],[1,1,1])).toEqual([0,0,0]);
    for(const energy of [[1,0,0],[0,1,0],[0,0,1],[1,2,4]] as const){
      const [low,mid,outer]=layerRatios(energy,[3,1,.25]);
      expect(low).toBeGreaterThanOrEqual(0);expect(mid).toBeGreaterThanOrEqual(low);expect(outer).toBe(1);expect(mid).toBeLessThanOrEqual(outer);
    }
  });
  it('changes frequency prominence without introducing energy in an absent band',()=>{
    expect(weightedEnergy([1,0,2],[3,1,.25])).toEqual([3,0,.5]);
    expect(layerRatios([1,1,0],[3,1,1])).toEqual([.75,1,1]);
  });
});

it('can reproduce saturated spectral contrast without a second amplitude measure',()=>{
  const style={mode:'spectral' as const,strength:100,colors:{low:{h:0,s:100,l:50},mid:{h:120,s:100,l:50},high:{h:240,s:100,l:50}}};
  const paint=spectralPainter(style,'#888888','#000000',1.4);
  expect(paint([1,.5,.25])).toBe(`rgb(255, ${Math.round(255*.5**1.4)}, ${Math.round(255*.25**1.4)})`);
  expect(paint([0,0,0])).toBe('#000000');
});
