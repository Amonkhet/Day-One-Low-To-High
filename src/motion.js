import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import sizes from './image-sizes.json';

// Native scrolling throughout. Timelines pin only the scene being explained.
export function initMotion(){
 const mm=gsap.matchMedia();
 const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 const stage=document.querySelector('.evolution-stage');
 const low=stage.querySelector('.sketch-phase'),wire=stage.querySelector('.wire-phase'),high=stage.querySelector('.high-phase');
 const matrix=high.querySelector('.high-matrix'),bar=stage.querySelector('.inline-review'),nodes=[...bar.querySelectorAll('.fidelity-node')];
 const phases={low,wire,high};
 let timeline,reviewReady=false,reviewChoice='high';
 const setActive=id=>document.querySelectorAll('.dot-nav a').forEach(a=>{
  const active=a.hash==='#'+id;a.classList.toggle('active',active);
  if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');
 });
 const fitMatrices=()=>document.querySelectorAll('.high-matrix:not(.review-phase .high-matrix)').forEach(el=>{
  const fit=()=>el.style.setProperty('--matrix-scale',Math.max(.15,Math.min(1,el.parentElement.clientWidth/1450,(innerHeight-240)/620)));
  new ResizeObserver(fit).observe(el.parentElement);fit();
 });

 // An independent review layer avoids overwriting any scroll-timeline state.
 const review=document.createElement('div');review.className='evolution-review';review.hidden=true;
 Object.entries(phases).forEach(([key,el])=>{
  const clone=el.cloneNode(true);clone.removeAttribute('id');clone.classList.add('review-phase');clone.dataset.fidelity=key;
  clone.querySelector('.inplace-findings')?.remove();
  clone.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
  const content=clone.querySelector('.feature-matrix,.sketch-pair');
  const frame=document.createElement('div');frame.className='review-content-frame';content.before(frame);frame.append(content);
  review.append(clone);
 });
 stage.append(review);fitMatrices();
 const fitReview=()=>{
  if(review.hidden)return;
  const active=[...review.children].find(el=>!el.hidden),frame=active?.querySelector('.review-content-frame');
  const content=frame?.firstElementChild;if(!content)return;
  content.style.zoom='1';
  const width=content.classList.contains('high-matrix')?1450:1100;
  content.style.width=width+'px';
  content.style.zoom=Math.min(frame.clientWidth/width,frame.clientHeight/content.offsetHeight,1);
 };
 const positionReviewBar=()=>{
  if(review.hidden)return;
  fitReview();
  const bounds=review.getBoundingClientRect(),parent=stage.getBoundingClientRect();
  Object.assign(bar.style,{left:(bounds.left-parent.left)+'px',right:'auto',width:bounds.width+'px',top:(bounds.bottom-parent.top+16)+'px',bottom:'auto'});
 };
 const reviewLayoutObserver=new ResizeObserver(positionReviewBar);reviewLayoutObserver.observe(stage);
 let reviewTransition;
 const choose=value=>{
  if(value===reviewChoice&&reviewReady)return;
  reviewTransition?.kill();
  const old=[...review.children].find(el=>!el.hidden),next=[...review.children].find(el=>el.dataset.fidelity===value);
  reviewChoice=value;nodes.forEach(node=>node.setAttribute('aria-pressed',String(node.dataset.fidelity===value)));
  const swap=()=>{
   [...review.children].forEach(el=>{el.hidden=el!==next;gsap.set(el,{clearProps:'opacity,transform'});});
   positionReviewBar();
  };
  if(!reviewReady||reduced||!old){swap();return;}
  reviewTransition=gsap.timeline().to(old,{opacity:0,y:-10,duration:.2,ease:'power1.in',onComplete:swap})
   .fromTo(next,{opacity:0,y:14},{opacity:1,y:0,duration:.3,ease:'power2.out',immediateRender:false});
 };
 nodes.forEach(node=>node.addEventListener('click',()=>{if(reviewReady)choose(node.dataset.fidelity);}));
 choose('high');

 // Same left/right composition for every feature. Only full-height source screens.
 const story=document.createElement('div');story.className='feature-story';
 const panels=[...matrix.querySelectorAll('.feature-slot')].map((slot,index)=>{
  const key=slot.className.split('group-')[1],panel=document.createElement('article');
  panel.className='story-panel';panel.dataset.feature=key;
  const copy=high.querySelector('[data-group="'+key+'"]').cloneNode(true);
  copy.className='story-copy';copy.removeAttribute('style');copy.removeAttribute('data-group');
  const count=document.createElement('span');count.className='story-count';count.textContent=`${String(index+1).padStart(2,'0')} / 06`;
  const purposes={
   journey:['Navigate unfamiliar everyday tasks.','Journey Tree breaks procedures such as visiting a GP or obtaining a driver licence into step-by-step guidance, showing what to do at each stage.'],
   simulation:['Practise before the real situation.','Scenario Simulation offers everyday situations and response choices so users can rehearse unfamiliar interactions before encountering them in person.'],
   explore:['Get to know the city through short trips.','Explore turns a local journey into a sequence of discoveries, combining route guidance, nearby places and progress feedback.'],
   tools:['Find practical help in one place.','Tools brings scanning, contextual questions and everyday assistance together, giving users a starting point for help while out in the city.'],
   ar:['Understand what is in front of you.','AR Lens connects signs and objects in the surrounding environment with explanations, such as guidance about public transport and Myki readers.'],
   ask:['Ask questions about this place.','Ask This Place provides location-related prompts and guidance for unfamiliar services, including what to say and what to do next.']
  };
  copy.querySelector('.eyebrow').textContent=purposes[key][0];
  copy.querySelector('p:last-child').textContent=purposes[key][1];
  copy.prepend(count);
  const screens=document.createElement('div');screens.className='story-screens';
  [...slot.querySelectorAll('img')].filter(img=>{
   const key=decodeURIComponent(img.getAttribute('src').replace('/assets/',''));const size=sizes[key];
   return !size||size[1]/size[0]<=2.2;
  }).slice(0,2).forEach(img=>{const clone=img.cloneNode();clone.loading='eager';screens.append(clone);});
  panel.append(copy,screens);story.append(panel);return panel;
 });
 high.append(story);
 high.querySelector('.inplace-findings').hidden=true;

 mm.add('(min-width:901px) and (min-height:650px) and (prefers-reduced-motion:no-preference)',()=>{
  stage.before(low,wire);low.classList.add('natural-low');wire.classList.add('natural-wire');
  stage.classList.add('continuous-motion');review.hidden=true;reviewReady=false;bar.inert=true;
  gsap.set(wire,{autoAlpha:1});gsap.set(high,{autoAlpha:1});gsap.set([story,bar],{autoAlpha:0});gsap.set(panels,{autoAlpha:0});
  const tl=gsap.timeline({defaults:{ease:'sine.inOut'},scrollTrigger:{
   trigger:stage,start:'top top',end:()=>'+='+Math.max(7000,innerHeight*10),pin:stage,scrub:.3,invalidateOnRefresh:true
  }});timeline=tl;
  tl.addLabel('lowOverview',0).addLabel('wireHold',0).addLabel('highOverview',0).to({}, {duration:2});
  panels.forEach(panel=>{
   tl.addLabel('feature-'+panel.dataset.feature).to({}, {duration:3.2});
  });
  tl.addLabel('review').to(bar,{autoAlpha:1,duration:.3}).to({}, {duration:2.5});

  // The scroll selects a feature; its entrance is a complete timed animation.
  // Keep the existing content nodes, with the matrix underneath the focus layer.
  let focused=-1,focusAnimation,pendingFocus=null;
  const focus=index=>{
   if(focusAnimation?.isActive()){pendingFocus=index;return;}
   if(index===focused)return;
   const previous=focused;focused=index;
   focusAnimation?.kill();
   const targets=panels.flatMap(p=>[p,p.querySelector('.story-copy'),p.querySelector('.story-screens')]);
   gsap.killTweensOf([matrix,story,...targets]);
   gsap.set(panels.filter((_,i)=>i!==previous),{autoAlpha:0});
   high.classList.toggle('feature-focused',index>=0);
   if(index<0){
    gsap.set(story,{autoAlpha:0});
    focusAnimation=gsap.to(matrix,{scale:1,filter:'blur(0px)',opacity:1,duration:.65,ease:'power2.inOut'});
    return;
   }
   if(previous<0)gsap.set(matrix,{transformOrigin:'50% 50%'});
   gsap.set(story,{autoAlpha:1});
   const panel=panels[index],copy=panel.querySelector('.story-copy'),screens=panel.querySelector('.story-screens');
   gsap.set(panel,{autoAlpha:1});
   focusAnimation=gsap.timeline({onComplete:()=>{const next=pendingFocus;pendingFocus=null;if(next!==null&&next!==focused)focus(next);}});
   if(previous>=0)focusAnimation.to(panels[previous],{autoAlpha:0,duration:.25,ease:'sine.out'},0);
   focusAnimation
    .to(matrix,{scale:1.08,filter:'blur(12px)',opacity:.6,duration:.85,ease:'power2.inOut'},0)
    .fromTo(copy,{autoAlpha:0,y:22},{autoAlpha:1,y:0,duration:.7,ease:'power2.out'},.12)
    .fromTo(screens,{autoAlpha:0,y:30,scale:.96},{autoAlpha:1,y:0,scale:1,duration:.85,ease:'power2.out'},.22);
  };
  const update=()=>{
   const ready=tl.time()>=tl.labels.review;
   const index=ready?-1:panels.findLastIndex(p=>tl.time()>=tl.labels['feature-'+p.dataset.feature]);
   focus(index);
   const enteringReview=ready&&!reviewReady;
   reviewReady=ready;review.hidden=!ready;bar.inert=!ready;
   stage.classList.toggle('showing-review',ready);
   if(enteringReview)gsap.fromTo(review,{scale:1,opacity:0},{scale:.82,opacity:1,duration:.75,ease:'power2.out',overwrite:true,onUpdate:positionReviewBar});
   Object.entries(phases).forEach(([key,el])=>{el.inert=ready||getComputedStyle(el).visibility==='hidden';});
   panels.forEach(el=>el.setAttribute('aria-hidden',getComputedStyle(el).visibility==='hidden'));
   if(tl.scrollTrigger.isActive)setActive(tl.time()<tl.labels.highOverview-.7?'wireframe':'initial-high');
  };
  tl.eventCallback('onUpdate',update);update();
  // Consume one wheel burst per local scene, including trackpad inertia.
  // This listener never intercepts Evaluation or Comparison.
  const stops=['lowOverview','wireHold','highOverview',...panels.map(p=>'feature-'+p.dataset.feature),'review'];
  let lastWheel=0,burstUsed=false,stepTween=null,requestedStep=null;
  const wheel=event=>{
   if(event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||!event.deltaY)return;
   const st=tl.scrollTrigger,y=window.scrollY;
   if(y<st.start-2||y>st.end+2)return;
   const firstTime=tl.labels['feature-'+panels[0].dataset.feature];
   const firstY=st.start+(st.end-st.start)*firstTime/tl.duration();
   if(y<firstY-2){
    const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
    if(y+delta<firstY||delta<0)return;
    event.preventDefault();window.scrollTo({top:firstY+2,behavior:'instant'});
    burstUsed=true;lastWheel=performance.now();return;
   }
   const now=performance.now();if(now-lastWheel>120)burstUsed=false;lastWheel=now;
   const time=tl.time();
   let current=0;stops.forEach((name,i)=>{if(time>=tl.labels[name]-.12)current=i;});
   if(requestedStep!==null)current=requestedStep;
   const direction=Math.sign(event.deltaY);
   if((current===0&&direction<0)||(current===stops.length-1&&direction>0)){
    if(!burstUsed){stepTween?.kill();requestedStep=null;return;}
   }
   event.preventDefault();
   if(burstUsed)return;
   burstUsed=true;
   const next=Math.max(0,Math.min(stops.length-1,current+direction));
   const destination=st.start+(st.end-st.start)*(tl.labels[stops[next]]+.04)/tl.duration();
   stepTween?.kill();requestedStep=next;
   const position={y};
   stepTween=gsap.to(position,{y:destination,duration:.8,ease:'power2.inOut',onComplete:()=>{requestedStep=null;},onUpdate:()=>window.scrollTo({top:position.y,behavior:'instant'})});
  };
  window.addEventListener('wheel',wheel,{passive:false});

  return()=>{stage.prepend(low,wire);low.classList.remove('natural-low');wire.classList.remove('natural-wire');window.removeEventListener('wheel',wheel);stepTween?.kill();focusAnimation?.kill();gsap.set([matrix,story,...panels,...panels.flatMap(p=>[p.querySelector('.story-copy'),p.querySelector('.story-screens')])],{clearProps:'all'});high.classList.remove('feature-focused');timeline=null;stage.classList.remove('continuous-motion','showing-review');review.hidden=true;reviewReady=false;Object.values(phases).forEach(el=>el.inert=false);panels.forEach(el=>el.removeAttribute('aria-hidden'));};
 });

 // Small screens / reduced motion retain every phase and finding in normal flow.
 mm.add('(max-width:900px), (max-height:649px), (prefers-reduced-motion:reduce)',()=>{
  stage.classList.add('reading-layout');bar.hidden=true;review.hidden=true;story.style.visibility='visible';
  return()=>{stage.classList.remove('reading-layout');bar.hidden=false;story.style.removeProperty('visibility');};
 });

 mm.add('(prefers-reduced-motion:no-preference)',()=>{
  const e=document.querySelector('#evaluation');
  e.querySelectorAll('h2,.evaluation-bridge,.bridge-detail,.method-summary,.note,.evaluation-findings h3,.findings-intro,.summary-point').forEach(el=>{
   gsap.fromTo(el,{opacity:.15,y:28},{opacity:1,y:0,duration:.8,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 96%',once:true}});
  });

 });

 document.querySelectorAll('.comparison-sequence').forEach(seq=>{
  const scene=seq.querySelector('.comparison-stage'),theatre=seq.querySelector('.comparison-theatre');
  const copy=seq.querySelector('.travelling-copy'),problem=seq.querySelector('.problem-copy'),solution=seq.querySelector('.solution-copy');
  const wipe=seq.querySelector('.wipe'),input=wipe.querySelector('input'),hint=seq.querySelector('.compare-instruction');
  let manualRender=null;
  const split=v=>{wipe.style.setProperty('--split',v+'%');wipe.style.setProperty('--handle-x',v>94?'-100%':v<6?'0%':'-50%');input.value=v;input.setAttribute('aria-valuetext',Math.round(v)+' percent refined design');};
  input.addEventListener('input',()=>{const p=Number(input.value);split(p);manualRender?.(p/100);});
  mm.add('(min-width:901px) and (min-height:650px) and (prefers-reduced-motion:no-preference)',()=>{
   scene.classList.add('motion-enabled');let complete=false;const progress={p:0};
   const text=p=>{
    gsap.set(copy,{x:(theatre.clientWidth-copy.offsetWidth)*p});
    problem.style.visibility=p<.5?'visible':'hidden';solution.style.visibility=p>=.5?'visible':'hidden';
    problem.setAttribute('aria-hidden',p>=.5);solution.setAttribute('aria-hidden',p<.5);
   };manualRender=text;
   const render=()=>{
    const done=progress.p>=.999;
    if(!complete||!done){split(progress.p*100);text(progress.p);}
    complete=done;input.disabled=!done;wipe.classList.toggle('manual-ready',done);
    hint.textContent=done?'Drag the divider to compare · Scroll to continue':'Scroll to reveal the refinement';
   };
   render();
   gsap.timeline({scrollTrigger:{trigger:seq,start:'top 24px',end:()=>'+='+Math.max(1250,innerHeight*1.9),pin:scene,scrub:.3,invalidateOnRefresh:true,onRefresh:()=>text(Number(input.value)/100)}})
    .to({}, {duration:1.2}).to(progress,{p:1,duration:1.6,ease:'sine.inOut',onUpdate:render}).to({}, {duration:2.1});
   return()=>{scene.classList.remove('motion-enabled');manualRender=null;gsap.set(copy,{clearProps:'transform'});[problem,solution].forEach(el=>{el.style.removeProperty('visibility');el.removeAttribute('aria-hidden');});input.disabled=false;wipe.classList.add('manual-ready');};
  });
  mm.add('(max-width:900px), (max-height:649px), (prefers-reduced-motion:reduce)',()=>{
   input.disabled=false;wipe.classList.add('manual-ready');split(50);hint.textContent='Drag the divider to compare';
  });
 });

 // Each ring draws to its reported fraction; completed drawings never rewind.
 mm.add('(prefers-reduced-motion:no-preference)',()=>{
  document.querySelectorAll('.ring-value').forEach(ring=>{
   const count=Number(ring.getAttribute('stroke-dasharray').split(' ')[0]);
   ring.style.strokeDasharray='0 6';
   ScrollTrigger.create({trigger:ring.closest('.finding-ring'),start:'top 94%',end:'top 58%',onUpdate:self=>{
    const value=count*self.progress;ring.style.strokeDasharray=`${value} ${6-value}`;
    if(self.progress===1)self.kill();
   }});
  });
  return()=>document.querySelectorAll('.ring-value').forEach(ring=>ring.style.removeProperty('stroke-dasharray'));
 });

 // Larger, offset groups settle into place; completed entrances stay settled.
 mm.add('(prefers-reduced-motion:no-preference)',()=>{
  const blocks=[...low.querySelectorAll('figure'),...wire.querySelectorAll('.feature-slot'),...matrix.querySelectorAll('.feature-slot'),...document.querySelectorAll('#evaluation .stats>div,.problem-summary,.depth-showcase')];
  blocks.forEach((el,i)=>{
   const tween=gsap.fromTo(el,{scale:1.26,y:110,x:(i%2?1:-1)*26,opacity:.45},{scale:1,y:0,x:0,opacity:1,ease:'none',paused:true});
   ScrollTrigger.create({trigger:el,start:'top 95%',end:'top 42%',onUpdate:self=>{tween.progress(self.progress);if(self.progress===1)self.kill();}});
  });
 });
 const deck=document.querySelector('.depth-showcase');
 if(deck){
  const cards=[...deck.querySelectorAll('.depth-card')];let active=Math.floor(cards.length/2);
  const arrange=()=>{
   cards.forEach((card,i)=>{
    const d=i-active;card.style.setProperty('--offset',d);card.style.setProperty('--depth',Math.abs(d));card.style.zIndex=cards.length-Math.abs(d);
    card.setAttribute('aria-current',i===active?'true':'false');card.tabIndex=Math.abs(d)<=2?0:-1;
   });
   deck.querySelector('output').textContent=`${active+1} / ${cards.length} · ${cards[active].querySelector('img').alt}`;
   deck.querySelector('.deck-prev').disabled=active===0;deck.querySelector('.deck-next').disabled=active===cards.length-1;
  };
  cards.forEach((card,i)=>card.addEventListener('click',()=>{active=i;arrange();}));
  deck.querySelector('.deck-prev').addEventListener('click',()=>{active=Math.max(0,active-1);arrange();});
  deck.querySelector('.deck-next').addEventListener('click',()=>{active=Math.min(cards.length-1,active+1);arrange();});arrange();
 }

 document.querySelectorAll('[data-section]').forEach(el=>ScrollTrigger.create({trigger:el,start:'top 40%',end:'bottom 40%',onToggle:self=>{if(self.isActive)setActive(el.id);}}));
 document.querySelectorAll('nav a,footer a').forEach(a=>a.addEventListener('click',event=>{
  const id=a.hash.slice(1),target=document.getElementById(id);if(!target)return;
  event.preventDefault();let top=target.getBoundingClientRect().top+scrollY-32;
  if(timeline&&id==='initial-high'){
   const label={'low-fi':'lowOverview',wireframe:'wireHold','initial-high':'highOverview'}[id];
   top=timeline.scrollTrigger.start+(timeline.scrollTrigger.end-timeline.scrollTrigger.start)*timeline.labels[label]/timeline.duration();
  }
  window.scrollTo({top,behavior:reduced?'instant':'smooth'});history.replaceState(null,'',a.hash);
 }));
 const refresh=()=>ScrollTrigger.refresh();
 if(document.readyState==='complete')refresh();else window.addEventListener('load',refresh,{once:true});
}
