
"use strict";
export function mountEditor({config,onChange=()=>{}}){
  const groups=[
    ["Terrain",[
      ["terrain.scale","Feature scale",60,600,1,"Controls the size of the terrain features."],
      ["terrain.amplitude","Elevation",0,2,.05,"Controls the height of the terrain."],
      ["terrain.speed","Evolution speed",-1,1,.01,"Negative values reverse the animation."],
      ["terrain.detail","Detail",0,1,.01,"Adds smaller terrain variations."],
      ["terrain.rotation","Rotation",-180,180,1,"Rotates the terrain field in degrees."]]],
    ["Contour lines",[
      ["contours.interval","Elevation interval",.04,.5,.01,"Smaller intervals create more contour lines."],
      ["contours.lineWidth","Line width",0,4,.1,"Width of ordinary contours in CSS pixels."],
      ["contours.opacity","Opacity",0,1,.01,"Opacity of contour lines and glow."],
      ["contours.color","Line color","color",null,null,"Base RGB color of the contours."],
      ["contours.majorEvery","Major line every",1,10,1,"Emphasizes every Nth contour, anchored at elevation zero."],
      ["contours.majorWidth","Major line width",0,6,.1,"Width of emphasized contour lines."]]],
    ["Mouse",[
      ["mouse.enabled","Enabled","boolean",null,null,"Enables mouse-controlled terrain deformation."],
      ["mouse.mode","Mode","select",["hill","depression"],null,"Raise or lower terrain beneath the pointer."],
      ["mouse.radius","Influence radius",30,500,1,"Radius of the Gaussian terrain deformation in CSS pixels."],
      ["mouse.strength","Elevation strength",0,2,.05,"Magnitude of the mouse elevation change."],
      ["mouse.smoothing","Response speed",1,20,.5,"Higher values follow the pointer more quickly."],
      ["mouse.color","Mouse color","color",null,null,"Contour tint near the pointer."]]],
    ["Glow",[
      ["glow.enabled","Enabled","boolean",null,null,"Enable soft shader-based contour glow."],
      ["glow.intensity","Intensity",0,1,.01,"Brightness of the glow around contours."],
      ["glow.blur","Blur",0,30,1,"Approximate radius of the glow in CSS pixels."]]],
    ["Rendering",[["resolution","Sampling spacing",8,32,1,"GPU quality: 14 is the baseline; higher numbers reduce render resolution for performance."]]],
    ["Settings pane",[["panel.enabled","Enable pane","boolean",null,null,"Hide the settings interface until the next page reload."]]]
  ];
  const root=document.createElement("div");root.className="topo-editor";
  root.setAttribute("data-background-editor","");
  root.innerHTML=`<button class="topo-launcher" type="button" aria-expanded="false">Settings</button>
    <aside class="topo-panel" aria-label="Topographic settings" inert>
      <div class="topo-header"><strong>Topographic contours</strong><button class="topo-close" type="button">Retract →</button></div>
      <div class="topo-body"><div class="topo-controls"></div>
      <div class="topo-actions"><button class="topo-show" type="button">Show code</button><button class="topo-copy" type="button">Copy config</button></div>
      <textarea readonly spellcheck="false" hidden aria-label="Current configuration code"></textarea>
      <div class="topo-status" role="status"></div>
      <p class="topo-hint">Changes apply immediately. Copy the configuration into index.html to save it permanently.</p>
      <p class="topo-hint">Hover over any setting to see an explanation. Sections can be collapsed.</p></div></aside>
    <div class="topo-tooltip" role="tooltip"></div>`;
  document.body.appendChild(root);
  const $=s=>root.querySelector(s),panel=$(".topo-panel"),launcher=$(".topo-launcher"),
    controls=$(".topo-controls"),code=$("textarea"),show=$(".topo-show"),status=$(".topo-status"),tooltip=$(".topo-tooltip");
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const get=path=>path.split(".").reduce((o,k)=>o[k],config);
  const set=(path,value)=>{const keys=path.split("."),last=keys.pop();keys.reduce((o,k)=>o[k],config)[last]=value;onChange(path);refresh();if(path==="panel.enabled"&&!value){setOpen(false);root.hidden=true;}};
  const getCode=()=>"const config = "+JSON.stringify(config,null,4)+";";
  function refresh(){code.value=getCode();status.textContent="";}
  function setOpen(open){open=Boolean(open&&config.panel.enabled);panel.classList.toggle("open",open);panel.inert=!open;launcher.hidden=open;launcher.setAttribute("aria-expanded",String(open));if(open)$(".topo-close").focus();else launcher.focus();hideTip();}
  function hideTip(){tooltip.classList.remove("visible");}
  function tipFor(row,help){if(!help)return;tooltip.textContent=help;tooltip.classList.add("visible");const r=row.getBoundingClientRect(),w=tooltip.offsetWidth;tooltip.style.left=Math.max(8,r.left-w-12)+"px";tooltip.style.top=clamp(r.top,8,innerHeight-tooltip.offsetHeight-8)+"px";}
  let counter=0;
  const hex=color=>"#"+color.map(v=>Math.round(clamp(v,0,255)).toString(16).padStart(2,"0")).join("");
  const fromHex=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16));
  for(const [title,fields] of groups){
    const details=document.createElement("details");details.open=title!=="Settings pane";
    const summary=document.createElement("summary");summary.textContent=title;
    const fieldBox=document.createElement("div");fieldBox.className="topo-fields";
    details.append(summary,fieldBox);
    for(const [path,labelText,type,max,step,help] of fields){
      const row=document.createElement("div"),label=document.createElement("label"),id="topo-"+(counter++);
      row.className="topo-control";label.htmlFor=id;label.textContent=labelText;row.appendChild(label);
      row.addEventListener("pointerenter",()=>tipFor(row,help));row.addEventListener("pointerleave",hideTip);
      row.addEventListener("focusin",()=>tipFor(row,help));row.addEventListener("focusout",hideTip);
      if(type==="boolean"){
        const input=document.createElement("input");input.id=id;input.type="checkbox";input.checked=get(path);
        input.addEventListener("change",()=>set(path,input.checked));row.append(input);
      }else if(type==="select"){
        const input=document.createElement("select");input.id=id;
        for(const value of max){const option=document.createElement("option");option.value=value;option.textContent=value[0].toUpperCase()+value.slice(1);input.append(option);}
        input.value=get(path);input.addEventListener("change",()=>set(path,input.value));row.append(input);
      }else if(type==="color"){
        const wrapper=document.createElement("div"),picker=document.createElement("input"),rgb=document.createElement("div");
        wrapper.className="topo-colors";rgb.className="topo-rgb";picker.type="color";picker.id=id;picker.value=hex(get(path));
        const inputs=[0,1,2].map(i=>{const input=document.createElement("input");input.type="number";input.min=0;input.max=255;input.step=1;input.value=get(path)[i];input.setAttribute("aria-label",labelText+" "+["R","G","B"][i]);
          input.addEventListener("input",()=>{if(!Number.isFinite(input.valueAsNumber))return;const color=[...get(path)];color[i]=Math.round(clamp(input.valueAsNumber,0,255));picker.value=hex(color);set(path,color);});
          input.addEventListener("change",()=>{input.value=get(path)[i];});rgb.append(input);return input;});
        picker.addEventListener("input",()=>{const color=fromHex(picker.value);inputs.forEach((input,i)=>input.value=color[i]);set(path,color);});
        wrapper.append(picker,rgb);row.append(wrapper);
      }else{
        const number=document.createElement("input"),range=document.createElement("input");number.type="number";range.type="range";number.id=id;
        for(const input of [number,range]){input.min=type;input.max=max;input.step=step;input.value=get(path);}
        const update=(source,target)=>{let value=source.valueAsNumber;if(!Number.isFinite(value))return;value=clamp(value,type,max);if(step===1)value=Math.round(value);target.value=value;set(path,value);};
        number.addEventListener("input",()=>update(number,range));range.addEventListener("input",()=>update(range,number));
        number.addEventListener("change",()=>{number.value=get(path);});row.append(number,range);
      }
      fieldBox.append(row);
    }
    controls.append(details);
  }
  launcher.addEventListener("click",()=>setOpen(true));$(".topo-close").addEventListener("click",()=>setOpen(false));
  const onKeydown=e=>{if(e.key==="Escape"&&panel.classList.contains("open"))setOpen(false);};
  document.addEventListener("keydown",onKeydown);
  show.addEventListener("click",()=>{refresh();code.hidden=!code.hidden;show.textContent=code.hidden?"Show code":"Hide code";});
  $(".topo-copy").addEventListener("click",async()=>{refresh();try{await navigator.clipboard.writeText(getCode());status.textContent="Configuration copied.";}catch{code.hidden=false;show.textContent="Hide code";code.focus();code.select();status.textContent="Code selected. Press Ctrl+C to copy.";}});
  refresh();root.hidden=!config.panel.enabled;
  return {destroy(){document.removeEventListener("keydown",onKeydown);root.remove();}};
}
