import * as THREE from 'three';

const clamp = THREE.MathUtils.clamp;
const smooth = (value, start, end) => THREE.MathUtils.smoothstep(value, start, end);
const mix = THREE.MathUtils.lerp;
const UP = new THREE.Vector3(0, 1, 0);

function makeDee() {
  const group = new THREE.Group(), torso = new THREE.Group();
  group.add(torso);
  const yellow = new THREE.MeshPhysicalMaterial({color:0xffda46, roughness:.58, clearcoat:.12, clearcoatRoughness:.6});
  const black = new THREE.MeshStandardMaterial({color:0x22242a, roughness:.72});
  const white = new THREE.MeshStandardMaterial({color:0xfffdf8, roughness:.32});
  const pupilMat = new THREE.MeshStandardMaterial({color:0x101115, roughness:.28});
  const shape = new THREE.Shape();
  shape.moveTo(-52,52); shape.lineTo(-2,52);
  shape.bezierCurveTo(28,52,50,30,50,0); shape.bezierCurveTo(50,-30,28,-52,-2,-52);
  shape.lineTo(-52,-52); shape.lineTo(-52,-6); shape.lineTo(-26,-6); shape.lineTo(-26,-26); shape.lineTo(-2,-26);
  shape.bezierCurveTo(13,-26,24,-15,24,0); shape.bezierCurveTo(24,15,13,26,-2,26); shape.lineTo(-52,26); shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape,{depth:22,steps:1,bevelEnabled:true,bevelThickness:5,bevelSize:5,bevelSegments:5,curveSegments:36});
  geometry.translate(0,0,-11); geometry.scale(.025,.025,.025);
  const body = new THREE.Mesh(geometry,yellow); body.castShadow=true; body.receiveShadow=true; torso.add(body);
  const sphere = new THREE.SphereGeometry(1,28,20), cylinder = new THREE.CylinderGeometry(1,1,1,14);
  const ball = (parent,position,scale,material=black) => {
    const mesh = new THREE.Mesh(sphere,material); mesh.position.set(...position); mesh.scale.set(...scale); mesh.castShadow=true; parent.add(mesh); return mesh;
  };
  const tube = (parent,points,radius) => {
    const curve = new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve,20,radius,9,false),black); mesh.castShadow=true; parent.add(mesh); return mesh;
  };
  const segment = parent => {const mesh=new THREE.Mesh(cylinder,black); mesh.castShadow=true; parent.add(mesh); return mesh;};
  const direction = new THREE.Vector3(), middle = new THREE.Vector3();
  const bone = (mesh,a,b,radius) => {
    direction.subVectors(b,a); const length=direction.length();
    mesh.position.copy(middle.addVectors(a,b).multiplyScalar(.5));
    mesh.scale.set(radius,length,radius); mesh.quaternion.setFromUnitVectors(UP,direction.normalize());
  };
  const eyes = [];
  for (const [x,y] of [[.18,.88],[.76,.84]]) {
    const eye=ball(torso,[x,y,.46],[.2,.28,.12],white);
    const pupil=ball(torso,[x+.035,y-.015,.57],[.098,.17,.052],pupilMat);
    const eyebrow=new THREE.Group(); eyebrow.position.set(x,y+.35,.47); torso.add(eyebrow);
    tube(eyebrow,[[-.17,0,0],[0,.05,.01],[.16,0,0]],.043);
    eyes.push({eye,pupil,eyebrow,x,y});
  }
  const smile=tube(torso,[[.84,.28,.42],[.94,.19,.43],[1.05,.27,.42]],.025);
  const arms = [-1,1].map(side=>{
    const root=new THREE.Group(); torso.add(root);
    const upper=segment(root),forearm=segment(root),elbow=ball(root,[0,0,0],[.081,.081,.081]);
    const hand=new THREE.Group(); root.add(hand);
    ball(hand,[0,0,0],[.15,.12,.105]);
    // A real two-joint index, curled support fingers and a separate thumb.
    const indexUpper=segment(hand),indexLower=segment(hand),indexJoint=ball(hand,[0,0,0],[.042,.042,.042]);
    const fingertip=ball(hand,[0,0,0],[.043,.043,.043]);
    for(const [x,y,z] of [[.10,-.05,.055],[.06,-.105,.015],[.01,-.12,-.04]])ball(hand,[x,y,z],[.075,.045,.043]);
    tube(hand,[[-.045,.085,.04],[.015,.15,.09],[.10,.145,.11]],.043);
    return {side,root,upper,forearm,elbow,hand,indexUpper,indexLower,indexJoint,fingertip,
      shoulder:new THREE.Vector3(side*1.15,-.46,.05), wrist:new THREE.Vector3(), tip:new THREE.Vector3(), weight:0};
  });
  const legs=[-.48,.55].map(x=>({x,upper:segment(group),lower:segment(group),knee:ball(group,[0,0,0],[.098,.098,.098]),shoe:ball(group,[x,-1.83,.19],[.36,.19,.47])}));
  const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),aim=new THREE.Vector3(),rest=new THREE.Vector3();
  const indexA=new THREE.Vector3(),indexB=new THREE.Vector3(),indexC=new THREE.Vector3();

  function articulate(target,seconds,travel,mobile,arrival) {
    const breath=Math.sin(seconds*Math.PI*2/3.8), sway=Math.sin(seconds*Math.PI*2/5.2);
    const presenting=smooth(arrival,.1,1),nod=Math.sin(Math.PI*clamp(arrival/1.15,0,1));
    torso.position.y=breath*.023-travel*.045-nod*.035;
    torso.rotation.x=-nod*.03;
    torso.scale.set(1-breath*.003,1+breath*.007,1);
    torso.rotation.z=sway*.009 + Math.sin(seconds*1.7)*travel*.018;
    group.updateMatrixWorld(true);
    const local=torso.worldToLocal(target.clone());
    const look=clamp(local.x/4,-1,1), lookUp=clamp((local.y-.85)/4,-1,1);
    const cycle=seconds%6.7;
    const pulse=(at,duration)=>cycle>at&&cycle<at+duration?Math.sin((cycle-at)/duration*Math.PI)**2:0;
    const blink=Math.max(pulse(2.4,.17),pulse(5.9,.14));
    for(const eye of eyes){
      eye.eye.scale.y=.28*(1-blink*.92);
      eye.pupil.scale.y=.17*(1-blink*.96);
      eye.pupil.position.set(eye.x+look*.063,eye.y-.015+lookUp*.045,.575);
      eye.eyebrow.rotation.z=-look*.045;
      eye.eyebrow.position.y=eye.y+.35+lookUp*.025+breath*.007;
    }
    smile.scale.y=1+breath*.035;
    // Blend both rigs during the crossing; no instant left/right arm swap.
    // On a phone both text columns sit overhead: use the open-notch side,
    // keeping the raised hand clear of the eyes instead of half-folding both hands.
    const rightWeight=mobile?0:smooth(local.x,-.65,.65);
    for(const arm of arms){
      const side=arm.side;
      const weight=(side<0?1-rightWeight:rightWeight)*(1-travel*.48)*presenting;
      arm.weight=weight;
      aim.subVectors(local,arm.shoulder); aim.z=0; aim.normalize();
      const reach=mobile?.98:.95;
      rest.set(side*1.12,-.97+breath*.025,.54);
      arm.wrist.copy(arm.shoulder).addScaledVector(aim,reach); arm.wrist.z=.65;
      arm.wrist.lerp(rest,1-weight);
      // Wrist and elbow settle independently instead of rotating a frozen tube.
      arm.wrist.y+=Math.sin(seconds*1.65+.6)*.018*weight;
      a.copy(arm.shoulder);
      b.addVectors(a,arm.wrist).multiplyScalar(.5);
      b.x+=aim.y*side*.27*weight + side*.31*(1-weight);
      b.y-=Math.abs(aim.x)*.27*weight+.04*(1-weight); b.z=.32;
      bone(arm.upper,a,b,.078); bone(arm.forearm,b,arm.wrist,.073); arm.elbow.position.copy(b);
      arm.hand.position.copy(arm.wrist);
      const targetAngle=Math.atan2(local.y-arm.wrist.y,local.x-arm.wrist.x);
      const restAngle=side<0?-1.6:-1.5;
      // Angle wrapping prevents the wrist taking a full turn at the left edge.
      const angleDelta=Math.atan2(Math.sin(targetAngle-restAngle),Math.cos(targetAngle-restAngle));
      arm.hand.rotation.z=restAngle+angleDelta*weight;
      arm.hand.rotation.x=Math.sin(seconds*1.5)*.025;
      indexA.set(.10,.065,.035);
      indexB.set(mix(.15,.29,weight),mix(.14,.075,weight),.035);
      indexC.set(mix(.09,.47,weight),mix(.17,.08,weight),.035);
      bone(arm.indexUpper,indexA,indexB,.042); bone(arm.indexLower,indexB,indexC,.039);
      arm.indexJoint.position.copy(indexB); arm.fingertip.position.copy(indexC); arm.tip.copy(indexC);
    }
    group.updateMatrixWorld(true);
    for(const [i,leg] of legs.entries()){
      a.set(leg.x,-1.27,0); torso.localToWorld(a); group.worldToLocal(a);
      const lift=travel*.055*(.5+.5*Math.sin(seconds*5+i*Math.PI));
      c.set(leg.x,-1.72+lift,.08);
      b.addVectors(a,c).multiplyScalar(.5); b.x+=sway*.035; b.z+=.05+travel*.1;
      bone(leg.upper,a,b,.092); bone(leg.lower,b,c,.088); leg.knee.position.copy(b);
      leg.shoe.position.y=-1.83+lift; leg.shoe.rotation.x=-lift*.8; leg.shoe.rotation.z=sway*.006;
    }
    return arms[rightWeight>.5?1:0];
  }
  return {group,torso,articulate};
}

const POSES=[
  {x:2.03,y:0,ry:-.20,rz:-.018,scale:1.04},
  {x:-2.08,y:.1,ry:.22,rz:.018,scale:.96},
  {x:2.08,y:-.08,ry:-.18,rz:-.02,scale:.96},
  {x:-1.98,y:.05,ry:.20,rz:.018,scale:1.02},
];
function poseAt(progress){
  const at=Math.min(2,Math.floor(progress*3)),amount=clamp(progress*3-at,0,1);
  const eased=amount*amount*(3-2*amount),a=POSES[at],b=POSES[at+1];
  return Object.fromEntries(Object.keys(a).map(key=>[key,mix(a[key],b[key],eased)]));
}

export function createScene(host,{onContextLost}={}){
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0,0);
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.85;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
  const canvas=renderer.domElement;canvas.setAttribute('aria-hidden','true');host.appendChild(canvas);
  const lost=event=>{event.preventDefault();onContextLost?.();};canvas.addEventListener('webglcontextlost',lost);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(37,1,.1,70);
  scene.add(new THREE.HemisphereLight(0xfffaf0,0x494d61,1.25));
  const key=new THREE.DirectionalLight(0xfff5db,3.1);key.position.set(-3,6,7);key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-6;key.shadow.camera.right=6;key.shadow.camera.top=4;key.shadow.camera.bottom=-5;key.shadow.normalBias=.035;key.shadow.bias=-.0001;scene.add(key);
  const fill=new THREE.DirectionalLight(0xcbdcff,1.1);fill.position.set(5,1,4);scene.add(fill);
  const rim=new THREE.DirectionalLight(0xffffff,1.5);rim.position.set(1,4,-4);scene.add(rim);
  const dee=makeDee();scene.add(dee.group);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(30,16),new THREE.ShadowMaterial({opacity:.12,color:0x06070b}));floor.rotation.x=-Math.PI/2;floor.position.y=-2.06;floor.receiveShadow=true;scene.add(floor);
  let mobile=false,disposed=false,visible=true,lastTime=-Infinity,enteredAt=null,rect,inspection={};
  const resize=()=>{
    rect=host.getBoundingClientRect();mobile=innerWidth<=750&&!(innerWidth>innerHeight&&innerHeight<=500);
    renderer.setSize(Math.max(1,rect.width),Math.max(1,rect.height),false);
    camera.aspect=rect.width/Math.max(1,rect.height);
    const distance=mobile?Math.max(6.3,4.4/(2*Math.tan(THREE.MathUtils.degToRad(37/2))*camera.aspect)):Math.max(8.4,9.1/(2*Math.tan(THREE.MathUtils.degToRad(37/2))*camera.aspect));
    camera.position.set(0,.15,distance);camera.lookAt(0,-.24,0);camera.updateProjectionMatrix();
  };
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;});visibility.observe(host);
  const target=new THREE.Vector3(),ray=new THREE.Vector3(),wrist=new THREE.Vector3(),tip=new THREE.Vector3();
  const frame=(progress,pointer,time,headline,renderTime=time)=>{
    if(disposed||document.hidden||!visible||renderTime-lastTime<(mobile?1000/30-1:1000/60-1))return;
    lastTime=renderTime;
    const p=clamp(progress,0,1),pose=poseAt(p),seconds=time/1000;
    if(enteredAt===null)enteredAt=seconds;
    const travel=Math.sin(p*3*Math.PI)**2;
    dee.group.position.set(mobile?-.12:pose.x,mobile?0:pose.y,0);
    dee.group.rotation.set(pointer.y*.012,pose.ry+pointer.x*.018,pose.rz);
    dee.group.scale.setScalar(pose.scale*(mobile?.91:1));
    camera.position.x=pointer.x*.025;camera.lookAt(0,-.24,0);camera.updateMatrixWorld();
    // Convert the measured headline position into the character's 3D plane.
    target.set((headline.x*innerWidth-rect.left)/rect.width*2-1,1-(headline.y*innerHeight-rect.top)/rect.height*2,.5).unproject(camera);
    ray.subVectors(target,camera.position).normalize();
    target.copy(camera.position).addScaledVector(ray,(.5-camera.position.z)/ray.z);
    const hand=dee.articulate(target,seconds,travel,mobile,seconds-enteredAt);
    scene.updateMatrixWorld(true);
    wrist.copy(hand.wrist);hand.root.localToWorld(wrist);wrist.project(camera);
    tip.copy(hand.tip);hand.hand.localToWorld(tip);tip.project(camera);
    const px=(v)=>({x:(v.x+1)*rect.width/2+rect.left,y:(1-v.y)*rect.height/2+rect.top});
    const start=px(wrist),end=px(tip),aim={x:headline.x*innerWidth,y:headline.y*innerHeight};
    const dx=end.x-start.x,dy=end.y-start.y;
    const alignment=(dx*(aim.x-start.x)+dy*(aim.y-start.y))/(Math.hypot(dx,dy)*Math.hypot(aim.x-start.x,aim.y-start.y));
    inspection={wrist:start,tip:end,target:aim,alignment,mobile,time};
    // Expose the actual projected gesture for local visual/rig QA, not an assumed language direction.
    canvas.dataset.gesture=Math.abs(dy)>Math.abs(dx)?(dy<0?'up':'down'):(dx<0?'left':'right');
    canvas.dataset.pointingX=dx<0?'left':'right';
    canvas.dataset.pointingY=dy<0?'up':'down';
    canvas.dataset.aimAlignment=alignment.toFixed(3);
    renderer.render(scene,camera);return true;
  };
  return {frame,inspect:()=>inspection,dispose(){disposed=true;observer.disconnect();visibility.disconnect();
    const geometries=new Set(),materials=new Set();scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);for(const material of Array.isArray(object.material)?object.material:object.material?[object.material]:[])materials.add(material);});
    geometries.forEach(geometry=>geometry.dispose());materials.forEach(material=>material.dispose());
    canvas.removeEventListener('webglcontextlost',lost);key.shadow.map?.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();
  }};
}
