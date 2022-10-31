var a=0,frout;
var carpassed=0,b=0,isp=1,ispi=1;
var rts,rtp,rtc;
var splastcar=[0,0,0,0],frin=[0,0,0,0],ispset=[0,1,2,5,10,25,50,100,1000,10000];
var q=[[],[],[],[],[],[],[],[]];
var greenn=5;

var countfr=0,sttime=0,carth=0,countrec=0,count=-1,frame=0,sett=0;
var spdata=[];
var start=false;
var GUI_MODE=true;
var countcam=0;
var recordingframe=-5;
var recordlist=[],result5=[];

function setup(){
  createCanvas(1280,720,WEBGL);
  frameRate(30);
  setAttributes('antialias', true);
  //addBut();
  //q something
  letsGo();
  console.log("flowrate_in red_time green_time flowrate_out density average_speed sds");
}

function draw(){
  background(0);
  camera(1000*Math.cos(countcam*0.01),1000*Math.sin(countcam*0.01),500,0,0,0,0,0,-1);
  
  //ui on the open page
  if(start) startG();
  else{
    
    for(var ispp=0;ispp<isp;ispp++){

      //if(frame%30==0  && recordingframe>0) console.log(flowRate()+((e.l[0].status) ? " G" : " R")+((e.l[2].status) ? " G " : " R ")+count);
    
      //spawn the car
      for(var j=0;j<4;j++) if(splastcar[j]+108000/frin[j]<frame) spcar(j);

      //start recording
      if(countfr>0 && recordingframe<0) recordingframe=frame;

      //change the lights
      for(var i=0;i<8;i++){
        if(frame%(e.lloop*30)>(e.l[i].green)*30 && frame%(e.lloop*30)<(e.l[i].red)*30){
          e.l[i].status=true;
          e.t[i].status=true;
        }
        else{
          e.l[i].status=false;
          e.t[i].status=false;
        }
      }
      if(frame%(e.lloop*30)==0) count++;
      if(frame-(e.lloop*60)==recordingframe && recordingframe>0){ record(); sett++; }
        
      //passed front car information to itself
      for(var i=0;i<8;i++){
        var spff=10.0; var cff=createVector(1000,1000);
        var c = new car;
        for(let c of q[i]){
          c.spf=spff; c.cf=cff; spff=c.sp-0.2; cff=c.back;
        }
        //console.log(q)
        
      }
      
      //update cars every frame
      for(var i=0;i<8;i++){
        var c = new car()
        for(let c of q[i]) c.update();
      }
      //count when passing the light
      for(var i=0;i<8;i++) {
        var c = new car;
        for(let c of q[i]) for(var k=0;k<8;k++) if(dis(c.x,c.y,e.l[k].x,e.l[k].y)<20.0 && !c.passed){
          carpassed++;
          countfr++;
          c.avsp=0.5/((frame-c.spt)/108000.0);
          spdata.push(c.avsp);
          c.passed=true;
        }
      }
      //check if it needs to be deleted
      for(var i=0;i<8;i++) if(q[i].length!=0){ 
        var c=q[i][0];
        if(c.x>5100 || c.x<-5100 || c.y<-5100 || c.y>5100) q[i].splice(0,1);
      }
      
      frame++;
    }
    countcam++;
    for(var i=0;i<8;i++){
      var c = new car;
      for(let c of q[i]) c.show();
    } 
    e.show();
  }
}

function keyPressed(){
  if(key=='b') GUI_MODE=!GUI_MODE;
  if(key=='a' && ispi!=0) ispi--;
  if(key=='s' && ispi!=9) ispi++;
  isp=ispset[ispi];
}


//this class stores light positions and its status
class light{
  constructor(x,y,green,yellow,red,status){
    this.x = x; this.y = y; this.green = green; this.yellow=yellow; this.red=red; this.status=status;
  }
}
class turn{
  constructor(x,y,di,status){
    this.x = x; this.y=y; this.di=di; this.status=status;
  }
}

class spawn{
  constructor(x,y,di,ovdis){
    this.x = x; this.y=y; this.di=di; this.ovdis=ovdis;
  }
}


//this class stores light traffics and draws environtment
class env{
  constructor(){
    this.y1=1,this.g1=9,this.y2=1,this.g2=9,this.lloop=this.y1+this.y2+this.g1+this.g2;  
    this.l = [];
    this.t = [];
    this.s = [];
  }
  
  
  init(){
    this.l.push(new light(70,15,0,this.g1,this.y1+this.g1,false));
    this.l.push(new light(70,45,0,this.g1,this.y1+this.g1,false));
    this.l.push(new light(-15,70,this.y1+this.g1,this.y1+this.g1+this.g2,this.y1+this.g1+this.g2+this.y2,false));
    this.l.push(new light(-45,70,this.y1+this.g1,this.y1+this.g1+this.g2,this.y1+this.g1+this.g2+this.y2,false));
    this.l.push(new light(-70,-15,0,this.g1,this.y1+this.g1,false));
    this.l.push(new light(-70,-45,0,this.g1,this.y1+this.g1,false));
    this.l.push(new light(15,-70,this.y1+this.g1,this.y1+this.g1+this.g2,this.y1+this.g1+this.g2+this.y2,false));
    this.l.push(new light(45,-70,this.y1+this.g1,this.y1+this.g1+this.g2,this.y1+this.g1+this.g2+this.y2,false));
    
    this.t.push(new turn(-15,15,HALF_PI,false));
    this.t.push(new turn(45,45,-HALF_PI,false));
    this.t.push(new turn(-15,-15,HALF_PI,false));
    this.t.push(new turn(-45,45,-HALF_PI,false));
    this.t.push(new turn(15,-15,HALF_PI,false));
    this.t.push(new turn(-45,-45,-HALF_PI,false));
    this.t.push(new turn(15,15,HALF_PI,false));
    this.t.push(new turn(45,-45,-HALF_PI,false));
    
    this.s.push(new spawn(5000,15,0,30));
    this.s.push(new spawn(5000,45,0,-30));
    this.s.push(new spawn(-15,5000,HALF_PI,30));
    this.s.push(new spawn(-45,5000,HALF_PI,-30));
    this.s.push(new spawn(-5000,-15,PI,30));
    this.s.push(new spawn(-5000,-45,PI,-30));
    this.s.push(new spawn(15,-5000,-HALF_PI,30));
    this.s.push(new spawn(45,-5000,-HALF_PI,-30));
  }
  
  show(){
    push();

    noStroke();
  
    //grass
    translate(0,0,-1);
    fill(28,107,43);
    rect(-5120,-5120,10240,10240);
    translate(0,0,1);

    //road
    fill(32);
    beginShape();
    vertex(-70,5000);
    vertex(70,5000);
    vertex(70,-5000);
    vertex(-70,-5000);
    endShape();
    beginShape();
    vertex(-5000,70);
    vertex(5000,70);
    vertex(5000,-70);
    vertex(-5000,-70);
    endShape();
    
    //line
    translate(0,0,0.1);
    noStroke();
    for(var i=0;i<=TWO_PI;i=i+HALF_PI){
      fill(255,255,0);
      rect(70,-0.5,4930,1);
      fill(255);
      rect(70,0.5,2,60);
      rect(70,29.5,200,1);
      rect(59.5,59.5,4930,1);
      rect(59.5,-60.5,4930,1);
      for(var j=70;j<5000;j=j+20){
        rect(j,-30.5,10,1);
        rect(j,29.5,10,1);
      }
      rotateZ(i);
    }
    
    pop();

    //lights
    push();
    translate(0,0,0.1);
    for(var i=0;i<8;i++){
      if(frame%(this.lloop*30)>=this.l[i].green*30 && frame%(this.lloop*30)<this.l[i].yellow*30) fill(0,255,0);
      else if(frame%(this.lloop*30)>=this.l[i].yellow*30 && frame%(this.lloop*30)<this.l[i].red*30) fill(255,255,0);
      else fill(255,0,0);
      ellipse(this.l[i].x,this.l[i].y,20,20);
    }
    /*
    for(int i=0;i<8;i++){
      if(l[i].status) fill(255,255,0);
      else fill(255);
      ellipse(t[i].x,t[i].y,5,5);
    }
    */
    pop();
  }
}

var e=new env;
//car class
class car{
  constructor(){
    this.sp=2; this.spf=10; this.a=0; this.ovt=-5;
    this.x; this.y; this.spm; this.ac; this.di; this.type; this.wide; this.length; this.ovdis; this.avsp;
    this.lane; this.spt; this.number; this.r; this.g; this.b;
    this.collision=false; this.passed=false; this.turn=false;
    this.ovma=createVector(0,0);
    this.front=createVector(0,0);
    this.frontr=createVector(0,0);
    this.back=createVector(0,0);
    this.cf=createVector(0,0);
    this.c=new cargo;
    this.p=new pickup;
    this.s=new sedan;
  }
  
  
  make(xx, yy, didi, ovdisovdis, lanelane, carth){  //initialize
    this.ovt=-5; this.a=0; this.collision=false; this.passed=false; this.turn=false; 
    this.number=carth;
    var rc=parseInt(random(1,7));
    var rt=parseInt(random(0,100));
    this.r=127+(rc/4)%2*128; this.g=127+(rc/2)%2*128; this.b=127+rc%2*128;
    if(rt>=rts){
      this.type=3;
      this.wide=this.s.wide; this.lengh=this.s.lengh; this.spm=5;
      this.ac=this.s.a;
    }
    if(rt>=rtp){
      this.type=2;
      this.wide=this.p.wide; this.lengh=this.p.lengh; this.spm=4;
      this.ac=this.p.a;
    }
    if(rt>=rtc){
      this.type=1;
      this.wide=this.c.wide; this.lengh=this.c.lengh; this.spm=3;
      this.ac=this.c.a;
    }
    this.sp=3;
    if(random(0,3)<0) this.turn=true;
    else this.turn=false;
    this.x=xx; this.y=yy; this.di=didi; this.ovdis=ovdisovdis; this.lane=lanelane;
    //x=cos(di)*1000-sin(di)*15-sin(di)*30*(lane%2);
    //y=cos(di-HALF_PI)*1000-sin(di-HALF_PI)*15-sin(di-HALF_PI)*30*(lane%2);
    this.passed=false;
    this.spt=frame;
  }
  
  update(){  //move every frame depends on speed
    //this.front.x=modelX(-10-this.lengh/2-calSafeDis(this.sp,this.spf,this.ac),0,0); this.front.y=modelY(-10-this.lengh/2-calSafeDis(this.sp,this.spf,this.ac),0,0);
    this.front=createVector(Math.cos(this.di)*(-20-this.lengh/2-calSafeDis(this.sp,this.spf,this.ac))+this.x,Math.sin(this.di)*(-20-this.lengh/2-calSafeDis(this.sp,this.spf,this.ac))+this.y);
    this.frontr=createVector(Math.cos(this.di)*(-20-this.lengh/2-calSafeDis(this.sp,0,this.ac))+this.x,Math.sin(this.di)*(-20-this.lengh/2-calSafeDis(this.sp,0,this.ac))+this.y);
    this.back=createVector(Math.cos(this.di)*(this.lengh/2)+this.x,Math.sin(this.di)*(this.lengh/2)+this.y);
    this.collision=false;
    if(dis(this.frontr.x,this.frontr.y,e.l[this.lane].x,e.l[this.lane].y)<20.0 && (!e.l[this.lane].status || frame%(e.lloop*30)>e.l[this.lane].red*30-this.sp/this.ac)) this.collision=true;
    if(pl(this.front.x,this.front.y,this.back.x,this.back.y,this.cf.x,this.cf.y)<20.0) this.collision=true;
    this.sp=this.sp+this.a;
    this.x=this.x+Math.cos(this.di+PI)*this.sp; this.y=this.y+Math.sin(this.di+PI)*this.sp;
    if(this.collision && this.sp>=0) this.a=-this.ac;
    else if(this.sp<this.spm) this.a=this.ac;
    else this.a=0;
  }
  
  show(){   //draw on screen
    /*
    if(this.a>0) fill(0,255,0);
    else if(this.a==0) fill(255,255,0);
    else fill(255,0,0);
    translate(0,0,20);
    ellipse(this.front.x,this.front.y,0,20,20);
    ellipse(this.frontr.x,this.frontr.y,20,20);
    translate(0,0,-20);
    */
    //ellipse(-20-lengh/2-sp*180,0,20,20);
    //ellipse(this.lengh/2-10,0,20,20);
    //ellipse(0,0,20,20); 
    //text(str(int(this.spf*60/10000*3600))+' '+str(int(this.sp*60/10000*3600)),0,0);
    push();
    translate(this.x,this.y,0);
    rotateZ(this.di);
    translate(-this.lengh/2,-this.wide/2,0);
    if(this.type==3) this.s.show(this.r,this.g,this.b);
    else if(this.type==2) this.p.show(this.r,this.g,this.b);
    else if(this.type==1) this.c.show(this.r,this.g,this.b);
    pop();
  }
  /*
  ov(){
    push();
    translate(this.x,this.y,0);
    rotateZ(this.di);
    x=modelX(0,ovdis,0); y=modelY(0,ovdis,0);
    ovdis=-ovdis;
    ovt=-5;
    pop();
  }
  */
}


//all functions
function testAxis(){
  push();
  stroke(255,0,0); line(0,0,0,10,0,0);
  stroke(0,255,0); line(0,0,0,0,10,0);
  stroke(0,0,255); line(0,0,0,0,0,10);
  pop();
}

function letsGo(){
  start=false;
  sttime=0;
  light2(greenn,5,greenn,5);
  frin[0]=500;
  frin[1]=500;
  frin[2]=500;
  frin[3]=500;
  rts=0;
  rtp=100;
  rtc=100;
  e.init();
}

class recorddata{
  constructor(rt,gt,fr,avg){
    this.redtime=rt; this.greentime=gt; this.flowrate=fr; this.avsp=avg; 
  }
}

function sortavsp(a,b){
  if(a.avsp<b.avsp) return 1;
  if(a.avsp>b.avsp) return -1;
  return 0;
}

function sortfr(a,b){
  if(a.flowrate<b.flowrate) return 1;
  if(a.flowrate>b.flowrate) return -1;
  return 0;
}

function bestresult(){
  result5=[];
  recordlist.sort(sortavsp);
  for(var i=0;i<5;i++) result5.push(recordlist[i]);
  result5.sort(sortfr);
  var rcdti=new recorddata;
  for(let rcdti of result5) console.log(rcdti.greentime+' '+rcdti.flowrate+' '+rcdti.avsp);
}

function flowRate(){
  return(countfr/((frame-recordingframe)/108000.0));
}

function averageSpeed(){
  var avsp=0;
  for(var j=0;j<countfr;j++) avsp+=1.0/spdata[j];
  return(parseFloat(countfr)/avsp);
}

function standardDeviationSpeed(){
  var avsp=averageSpeed(),sds=0;
  for(var j=0;j<countfr;j++) sds+=(spdata[j]-avsp)*(spdata[j]-avsp);
  return(Math.sqrt(sds/countfr));
}

function record(){
  console.log(frin[0]+" "+(e.y1+e.g2+e.y2)+" "+e.g1+" "+flowRate()+" "+flowRate()/averageSpeed()+" "+averageSpeed()+" "+standardDeviationSpeed());
  var rcdt=new recorddata(e.y1+e.y2+e.g2,e.g1,flowRate(),averageSpeed());
  recordlist.push(rcdt);
  if(e.g1==55) bestresult();
  reset();
  adjust();
}

function adjust(){
  //increase flowrate
  //for(var i=0;i<4;i++) frin[i]+=20;
  //increase light
  greenn++;
  light2(greenn,5,greenn,5);
}

//delete all car in system
function reset(){
  countfr=0; sttime=frame; carth=0; recordingframe=-5;
  for(var j=0;j<4;j++) splastcar[j]=0;
  for(var i=0;i<8;i++) q[i]=[];
  spdata=[];
}

function dis(x1, y1, x2, y2){
  return(Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2)));
}

function findAng(x1, y1, vx, vy, x2, y2){
  var p1=dis(vx,vy,x1,y1);
  var p2=dis(vx,vy,x2,y2);
  var pp=dis(x1,y1,x2,y2);
  return(Math.acos((p1*p1+p2*p2-pp*pp)/(2*p1*p2)*0.999));
}

function pl(lx1, ly1, lx2, ly2, px, py){
  if(findAng(lx1,ly1,lx2,ly2,px,py)>=HALF_PI) return dis(lx2,ly2,px,py);
  else if(findAng(lx2,ly2,lx1,ly1,px,py)>=HALF_PI) return dis(lx1,ly1,px,py);
  else return(Math.abs((ly2-ly1)*px-(lx2-lx1)*py+lx2*ly1-ly2*lx1)/dis(lx1,ly1,lx2,ly2));
}

function calSafeDis(v, vf, a){
  if(v<vf) return v*60;
  else return((v*v-vf*vf)/2.0/a);
}

function spcar(j){
  var r=parseInt(random(2*j,2*j+2));
  var c=new car;
  c.make(e.s[r].x,e.s[r].y,e.s[r].di,e.s[r].ovdis,r,carth);
  q[r].push(c);
  splastcar[j]=frame;
  carth++;
}

function search(n){
  
  for(var i=0;i<8;i++){
    var c = new car
    for(let c of q[i]) if(c.number==n) return true
  };
  return false;
}

function cameraAt(cn){
  for(var i=0;i<8;i++){
    var c=new car;
      for(let c of q[i]) if(c.number==cn){
      camera(c.x+Math.cos(c.di)*40.0,c.y+Math.sin(c.di)*40.0,50,c.x-Math.cos(c.di)*10.0,c.y-Math.sin(c.di)*10.0,50,-1,-1,-1);
      return ;
    }
  }
}

function random(min,max){
  return(Math.random()*(max-min)+min);
}

function light2(g1,y1,g2,y2){
  e.g1=g1; e.g2=g2; e.y1=y1; e.y2=y2;
  e.l=[];
  e.l.push(new light(70,15,0,g1,y1+g1,false));
  e.l.push(new light(70,45,0,g1,y1+g1,false));
  e.l.push(new light(-15,70,y1+g1,y1+g1+g2,y1+g1+g2+y2,false));
  e.l.push(new light(-45,70,y1+g1,y1+g1+g2,y1+g1+g2+y2,false));
  e.l.push(new light(-70,-15,0,g1,y1+g1,false));
  e.l.push(new light(-70,-45,0,g1,y1+g1,false));
  e.l.push(new light(15,-70,y1+g1,y1+g1+g2,y1+g1+g2+y2,false));
  e.l.push(new light(45,-70,y1+g1,y1+g1+g2,y1+g1+g2+y2,false));
  e.lloop=g1+g2+y1+y2;
}

function light4(g1,y1,g2,y2,g3,y3,g4,y4){
  e.l=[];
  e.l.push(new light(70,15,0,g1,y1+g1,false));
  e.l.push(new light(70,45,0,g1,y1+g1,false));
  e.l.push(new light(-15,70,y1+g1,y1+g1+g2,y1+g1+g2+y2,false));
  e.l.push(new light(-45,70,y1+g1,y1+g1+g2,y1+g1+g2+y2,false));
  e.l.push(new light(-70,-15,g1+y1+g2+y2,g1+y1+g2+y2+g3,g1+y1+g2+y2+g3+y3,false));
  e.l.push(new light(-70,-45,g1+y1+g2+y2,g1+y1+g2+y2+g3,g1+y1+g2+y2+g3+y3,false));
  e.l.push(new light(15,-70,g1+y1+g2+y2+g3+y3,g1+y1+g2+y2+g3+y3+g4,g1+y1+g2+y2+g3+y3+g4+y4,false));
  e.l.push(new light(45,-70,g1+y1+g2+y2+g3+y3,g1+y1+g2+y2+g3+y3+g4,g1+y1+g2+y2+g3+y3+g4+y4,false));
  e.lloop=g1+g2+g3+g4+y1+y2+y3+y4;
}


//each car
class sedan{
  constructor(){
    this.wide=17,this.lengh=43;
    this.a=25.0/3600;    
  }

  show(r,g,b){
    //console.log("call me")
    //reference : toyota corolla 2014
    push();
    fill(r,g,b);
    //stroke(0);
    //strokeWeight(1);
    noStroke();
  
    //body
    beginShape();
    vertex(2,17,8);
    vertex(0,17,2);
    vertex(0,0,2);
    vertex(2,0,8);
    endShape();

    beginShape();
    vertex(2,0,8);
    vertex(0,0,2);
    vertex(43,0,2);
    vertex(42,0,8);
    endShape();

    beginShape();
    vertex(42,0,8);
    vertex(43,0,2);
    vertex(43,17,2);
    vertex(42,17,8);
    endShape();

    beginShape();
    vertex(42,17,8);
    vertex(43,17,2);
    vertex(0,17,2);
    vertex(2,17,8);
    endShape();
  
    //upper&hood
    beginShape();
    vertex(18,3,14);
    vertex(30,3,14);
    vertex(30,14,14);
    vertex(18,14,14);
    endShape();

    beginShape();
    vertex(2,0,8);
    vertex(10,0,8);
    vertex(10,17,8);
    vertex(2,17,8);
    endShape();

    beginShape();
    vertex(33,0,8);
    vertex(42,0,8);
    vertex(42,17,8);
    vertex(33,17,8);
    endShape();
  
    //headlilght
    fill(255);
    beginShape();
    vertex(1.4,0,6.5);
    vertex(0.9,0,5);
    vertex(0.9,5,5);
    vertex(1.4,5,6.5);
    endShape();

    beginShape();
    vertex(1.4,17,6.5);
    vertex(0.9,17,5);
    vertex(0.9,12,5);
    vertex(1.4,12,6.5);
    endShape();
  
    //taillight
    fill(200,0,0);
    beginShape();
    vertex(42.3,0,6.8);
    vertex(42.5,0,5.6);
    vertex(42.5,4,5.6);
    vertex(42.3,4,6.8);
    endShape();

    beginShape();
    vertex(42.3,17,6.8);
    vertex(42.5,17,5.6);
    vertex(42.5,13,5.6);
    vertex(42.3,13,6.8);
    endShape();
  
    //glass
    fill(128);
    beginShape();
    vertex(18,14,14);
    vertex(10,17,8);
    vertex(10,0,8);
    vertex(18,3,14);
    endShape();

    beginShape();
    vertex(18,3,14);
    vertex(10,0,8);
    vertex(33,0,8);
    vertex(30,3,14);
    endShape();

    beginShape();
    vertex(30,3,14);
    vertex(33,0,8);
    vertex(33,17,8);
    vertex(30,14,14);
    endShape();

    beginShape();
    vertex(30,14,14);
    vertex(33,17,8);
    vertex(10,17,8);
    vertex(18,14,14);
    endShape();
  
    //wheels
    fill(128);
    beginShape();
    for(var i=0;i<TWO_PI;i+=PI/6) vertex(7+Math.cos(i)*2.5,-0.1,2.5+Math.sin(i)*2.5);
    endShape();
    beginShape();
    for(var i=0;i<TWO_PI;i+=PI/6) vertex(7+Math.cos(i)*2.5,17.1,2.5+Math.sin(i)*2.5);
    endShape();
    beginShape();
    for(var i=0;i<TWO_PI;i+=PI/6) vertex(33+Math.cos(i)*2.5,-0.1,2.5+Math.sin(i)*2.5);
    endShape();
    beginShape();
    for(var i=0;i<TWO_PI;i+=PI/6) vertex(33+Math.cos(i)*2.5,17.1,2.5+Math.sin(i)*2.5);
    endShape();

    pop();

  }
}
class pickup{
  constructor(){
    this.wide=17;this.lengh=51;
    this.a=25.0/3600;
  }

  show(r,g,b){
    
    //reference : mitsubishi l200
    push();

    fill(r,g,b);
    //stroke(0);
    //strokeWeight(1);
    noStroke();
  
    //body
    beginShape();
    vertex(1,17,12);
    vertex(0,17,5);
    vertex(0,0,5);
    vertex(1,0,12);
    endShape();

    beginShape();
    vertex(1,0,12);
    vertex(0,0,5);
    vertex(51,0,5);
    vertex(51,0,12);
    endShape();

    beginShape();
    vertex(51,0,12);
    vertex(51,0,5);
    vertex(51,17,5);
    vertex(51,17,12);
    endShape();

    beginShape();
    vertex(51,17,12);
    vertex(51,17,5);
    vertex(0,17,5);
    vertex(1,17,12);
    endShape();
  
    //upper&hood&cab
    beginShape();
    vertex(33,0.5,5);
    vertex(33,0.5,12);
    vertex(33,16.5,12);
    vertex(33,16.5,5);
    endShape();

    beginShape();
    vertex(1,0,12);
    vertex(12,0,12);
    vertex(12,17,12);
    vertex(1,17,12);
    endShape();

    beginShape();
    vertex(20,3,18);
    vertex(32,3,18);
    vertex(32,14,18);
    vertex(20,14,18);
    endShape();

    fill(128);
    beginShape();
    vertex(33.5,0.5,9);
    vertex(50.5,0.5,9);
    vertex(50.5,16.5,9);
    vertex(33.5,16.5,9);
    endShape();
  
    //headlilght
    fill(255);
    beginShape();
    vertex(0.8,1,11);
    vertex(0.5,1,9);
    vertex(0.5,4,9);
    vertex(0.8,4,11);
    endShape();

    beginShape();
    vertex(0.8,16,11);
    vertex(0.5,16,9);
    vertex(0.5,13,9);
    vertex(0.8,13,11);
    endShape();

    //taillight
    fill(200,0,0);
    beginShape();
    vertex(51.1,0,8);
    vertex(51.1,0,11);
    vertex(51.1,1.5,11);
    vertex(51.1,1.5,8);
    endShape();

    beginShape();
    vertex(51.1,17,8);
    vertex(51.1,17,11);
    vertex(51.1,15.5,11);
    vertex(51.1,15.5,8);
    endShape();
  
    //glass
    fill(128);
    beginShape();
    vertex(20,3,18);
    vertex(12,0,12);
    vertex(33,0,12);
    vertex(32,3,18);
    endShape();

    beginShape();
    vertex(32,3,18);
    vertex(33,0,12);
    vertex(33,17,12);
    vertex(32,14,18);
    endShape();

    beginShape();
    vertex(32,14,18);
    vertex(33,17,12);
    vertex(12,17,12);
    vertex(20,14,18);
    endShape();

    beginShape();
    vertex(20,14,18);
    vertex(12,17,12);
    vertex(12,0,12);
    vertex(20,3,18);
    endShape();
  
    //wheels
    fill(128);
    beginShape();
    for(var i=0;i<TWO_PI;i+=PI/6) vertex(8+Math.cos(i)*3,-0.1,3+Math.sin(i)*3);
    endShape();
    beginShape();
    for(var i=0;i<TWO_PI;i+=PI/6) vertex(8+Math.cos(i)*3,17.1,3+Math.sin(i)*3);
    endShape();
    beginShape();
    for(var i=0;i<TWO_PI;i+=PI/6) vertex(38+Math.cos(i)*3,-0.1,3+Math.sin(i)*3);
    endShape();
    beginShape();
    for(var i=0;i<TWO_PI;i+=PI/6) vertex(38+Math.cos(i)*3,17.1,3+Math.sin(i)*3);
    endShape();

    pop();


  }
}
class cargo{
  constructor(){
    this.wide=20;this.lengh=80;
    this.a=25.0/3600;
  
  }
  show(r,g,b){
    
    //reference : ford cargo 1723
    push();

    fill(r,g,b);
    //stroke(0);
    //strokeWeight(1);
    noStroke();
  
    //body
    beginShape();
    vertex(20,20,4);
    vertex(20,20,17);
    vertex(0,20,17);
    vertex(0,20,4);
    endShape();

    beginShape();
    vertex(0,20,4);
    vertex(0,20,17);
    vertex(0,0,17);
    vertex(0,0,4);
    endShape();

    beginShape();
    vertex(0,0,4);
    vertex(0,0,17);
    vertex(20,0,17);
    vertex(20,0,4);
    endShape();
  
    //upper&hood
    beginShape();
    vertex(5,0,27);
    vertex(20,0,27);
    vertex(20,20,27);
    vertex(5,20,27);
    endShape();
  
    //headlilght
    fill(255);
    beginShape();
    vertex(-0.1,1,13);
    vertex(-0.1,1,7);
    vertex(-0.1,3,7);
    vertex(-0.1,3,13);
    endShape();

    beginShape();
    vertex(-0.1,19,13);
    vertex(-0.1,19,7);
    vertex(-0.1,17,7);
    vertex(-0.1,17,13);
    endShape();
  
    //taillight
    fill(200,0,0);
    beginShape();
    vertex(80.1,0,6);
    vertex(80.1,0,4);
    vertex(80.1,4,4);
    vertex(80.1,4,6);
    endShape();

    beginShape();
    vertex(80.1,20,6);
    vertex(80.1,20,4);
    vertex(80.1,16,4);
    vertex(80.1,16,6);
    endShape();
    
    //container
    push();
    fill(216);
    beginShape();
    vertex(20,-2,32);
    vertex(20,-2,6);
    vertex(80,-2,6);
    vertex(80,-2,32);
    endShape();

    beginShape();
    vertex(80,-2,32);
    vertex(80,-2,6);
    vertex(80,22,6);
    vertex(80,22,32);
    endShape();

    beginShape();
    vertex(80,22,32);
    vertex(80,22,6);
    vertex(20,22,6);
    vertex(20,22,32);
    endShape();

    beginShape();
    vertex(20,22,32);
    vertex(20,22,6);
    vertex(20,-2,6);
    vertex(20,-2,32);
    endShape();

    beginShape();
    vertex(20,-2,32);
    vertex(20,22,32);
    vertex(80,22,32);
    vertex(80,-2,32);
    endShape();
    pop();
    
    //support
    push();
    fill(16);
    beginShape();
    vertex(20,-2,6);
    vertex(20,-2,4);
    vertex(20,22,4);
    vertex(20,22,6);
    endShape();

    beginShape();
    vertex(20,22,6);
    vertex(20,22,4);
    vertex(80,22,4);
    vertex(80,22,6);
    endShape();

    beginShape();
    vertex(80,22,6);
    vertex(80,22,4);
    vertex(80,-2,4);
    vertex(80,-2,6);
    endShape();

    beginShape();
    vertex(80,-2,6);
    vertex(80,-2,4);
    vertex(20,-2,4);
    vertex(20,-2,6);
    endShape();
    pop();
  
    //glass
    fill(128);
    beginShape();
    vertex(20,20,17);
    vertex(20,20,27);
    vertex(5,20,27);
    vertex(0,20,17);
    endShape();

    beginShape();
    vertex(0,20,17);
    vertex(5,20,27);
    vertex(5,0,27);
    vertex(0,0,17);
    endShape();

    beginShape();
    vertex(0,0,17);
    vertex(5,0,27);
    vertex(20,0,27);
    vertex(20,0,17);
    endShape();
  
    //wheels
    fill(128);
    beginShape();
    for(var i=0;i<TWO_PI;i+=PI/6) vertex(12+Math.cos(i)*4.5,-0.1,4.5+Math.sin(i)*4.5);
    endShape();
    beginShape();
    for(var i=0;i<TWO_PI;i+=PI/6) vertex(12+Math.cos(i)*4.5,22.1,4.5+Math.sin(i)*4.5);
    endShape();
    beginShape();
    for(var i=0;i<TWO_PI;i+=PI/6) vertex(60+Math.cos(i)*4.5,-0.1,4.5+Math.sin(i)*4.5);
    endShape();
    beginShape();
    for(var i=0;i<TWO_PI;i+=PI/6) vertex(60+Math.cos(i)*4.5,22.1,4.5+Math.sin(i)*4.5);
    endShape();

    pop();
    
  }
}
