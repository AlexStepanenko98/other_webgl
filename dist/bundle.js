let gl;
let position;
let tex;
let matrix;
let mainMatrix;
let start;
let rotates;


const vertex=`attribute vec4 position;
attribute vec2 tex;
varying vec2 tex_;
uniform mat4 matrix;


void main(){
	tex_=tex;
	gl_Position=matrix*position;
}`;


const fragment=`precision mediump float;
varying vec2 tex_;
uniform sampler2D text;


void main(){
	gl_FragColor=texture2D(text,tex_);
}`;


function createShader(type,source){
	const shader=gl.createShader(type);
	gl.shaderSource(shader,source);
	gl.compileShader(shader);
	if(gl.getShaderParameter(shader,gl.COMPILE_STATUS))
		return shader;
	alert(gl.getShaderInfoLog(shader));
	gl.deleteShader(shader);
}


function createProgram(){
	const vertexShader=createShader(gl.VERTEX_SHADER,vertex);
	const fragmentShader=createShader(gl.FRAGMENT_SHADER,fragment);
	const program=gl.createProgram();
	gl.attachShader(program,vertexShader);
	gl.attachShader(program,fragmentShader);
	gl.linkProgram(program);
	gl.deleteShader(vertexShader);
	gl.deleteShader(fragmentShader);
	if(gl.getProgramParameter(program,gl.LINK_STATUS))
		return program;
	alert(gl.getProgramInfoLog(program));
	gl.deleteProgram(program);
}


class Matrix{
	constructor(m){
		if(m===undefined){
			this.data=[
				1,0,0,0,
				0,1,0,0,
				0,0,1,0,
				0,0,0,1
			];
		}
		else
			this.data=m;
	}


	perspective(w,w_h,near,far){
		const f=Math.tan(Math.PI*0.5-w*0.5);
		const n=1/(near-far);
		this.data=[
			f/w_h,0,0,0,
			0,f,0,0,
			0,0,(near+far)*n,-1,
			0,0,near*far*n*2,0
		];
	}


	multiply(m,m_){
		if(m_===undefined){
			const data=[
				m[0]*this.data[0]+m[1]*this.data[4]+m[2]*this.data[8]+m[3]*this.data[12],
				m[0]*this.data[1]+m[1]*this.data[5]+m[2]*this.data[9]+m[3]*this.data[13],
				m[0]*this.data[2]+m[1]*this.data[6]+m[2]*this.data[10]+m[3]*this.data[14],
				m[0]*this.data[3]+m[1]*this.data[7]+m[2]*this.data[11]+m[3]*this.data[15],
				//
				m[4]*this.data[0]+m[5]*this.data[4]+m[6]*this.data[8]+m[7]*this.data[12],
				m[4]*this.data[1]+m[5]*this.data[5]+m[6]*this.data[9]+m[7]*this.data[13],
				m[4]*this.data[2]+m[5]*this.data[6]+m[6]*this.data[10]+m[7]*this.data[14],
				m[4]*this.data[3]+m[5]*this.data[7]+m[6]*this.data[11]+m[7]*this.data[15],
				//
				m[8]*this.data[0]+m[9]*this.data[4]+m[10]*this.data[8]+m[11]*this.data[12],
				m[8]*this.data[1]+m[9]*this.data[5]+m[10]*this.data[9]+m[11]*this.data[13],
				m[8]*this.data[2]+m[9]*this.data[6]+m[10]*this.data[10]+m[11]*this.data[14],
				m[8]*this.data[3]+m[9]*this.data[7]+m[10]*this.data[11]+m[11]*this.data[15],
				//
				m[12]*this.data[0]+m[13]*this.data[4]+m[14]*this.data[8]+m[15]*this.data[12],
				m[12]*this.data[1]+m[13]*this.data[5]+m[14]*this.data[9]+m[15]*this.data[13],
				m[12]*this.data[2]+m[13]*this.data[6]+m[14]*this.data[10]+m[15]*this.data[14],
				m[12]*this.data[3]+m[13]*this.data[7]+m[14]*this.data[11]+m[15]*this.data[15],
			];
			this.data=data;
		}
		else{
			if(m_===1){
				return this.multiply(m,[
					1,0,0,0,
					0,1,0,0,
					0,0,1,0,
					0,0,0,1
				]);
			}
			else{
				return [
					m[0]*m_[0]+m[1]*m_[4]+m[2]*m_[8]+m[3]*m_[12],
					m[0]*m_[1]+m[1]*m_[5]+m[2]*m_[9]+m[3]*m_[13],
					m[0]*m_[2]+m[1]*m_[6]+m[2]*m_[10]+m[3]*m_[14],
					m[0]*m_[3]+m[1]*m_[7]+m[2]*m_[11]+m[3]*m_[15],//
					m[4]*m_[0]+m[5]*m_[4]+m[6]*m_[8]+m[7]*m_[12],
					m[4]*m_[1]+m[5]*m_[5]+m[6]*m_[9]+m[7]*m_[13],
					m[4]*m_[2]+m[5]*m_[6]+m[6]*m_[10]+m[7]*m_[14],
					m[4]*m_[3]+m[5]*m_[7]+m[6]*m_[11]+m[7]*m_[15],//
					m[8]*m_[0]+m[9]*m_[4]+m[10]*m_[8]+m[11]*m_[12],
					m[8]*m_[1]+m[9]*m_[5]+m[10]*m_[9]+m[11]*m_[13],
					m[8]*m_[2]+m[9]*m_[6]+m[10]*m_[10]+m[11]*m_[14],
					m[8]*m_[3]+m[9]*m_[7]+m[10]*m_[11]+m[11]*m_[15],//
					m[12]*m_[0]+m[13]*m_[4]+m[14]*m_[8]+m[15]*m_[12],
					m[12]*m_[1]+m[13]*m_[5]+m[14]*m_[9]+m[15]*m_[13],
					m[12]*m_[2]+m[13]*m_[6]+m[14]*m_[10]+m[15]*m_[14],
					m[12]*m_[3]+m[13]*m_[7]+m[14]*m_[11]+m[15]*m_[15]
				];
			}
		}
	}
	

	translate(x,y,z,m){
		return this.multiply([
			1,0,0,0,
			0,1,0,0,
			0,0,1,0,
			x,y,z,1
		],m);
	}


	rotate(x,y,z,m){
		const all=new Matrix();
		if(x!=0){
			const c=Math.cos(x*Math.PI/180);
			const s=Math.sin(x*Math.PI/180);
			all.multiply([
				1,0,0,0,
				0,c,s,0,
				0,-s,c,0,
				0,0,0,1
			]);
		}
		if(y!=0){
			const c=Math.cos(y*Math.PI/180);
			const s=Math.sin(y*Math.PI/180);
			all.multiply([
				c,0,-s,0,
				0,1,0,0,
				s,0,c,0,
				0,0,0,1
			]);
		}
		if(z!=0){
			const c=Math.cos(z*Math.PI/180);
			const s=Math.sin(z*Math.PI/180);
			all.multiply([
				c,s,0,0,
				-s,c,0,0,
				0,0,1,0,
				0,0,0,1
			]);
		}
		return this.multiply(all.data,m);
	}


	scale(x,y,z,m){
		return this.multiply([
			x,0,0,0,
			0,y,0,0,
			0,0,z,0,
			0,0,0,1
		],m);
	}


	getDet(m){
		if(m===undefined){
			const A11=(this.getDet([
				this.data[5],this.data[6],this.data[7],
				this.data[9],this.data[10],this.data[11],
				this.data[13],this.data[14],this.data[15]
			]));
			const A12=-(this.getDet([
				this.data[4],this.data[6],this.data[7],
				this.data[8],this.data[10],this.data[11],
				this.data[12],this.data[14],this.data[15]
			]));
			const A13=(this.getDet([
				this.data[4],this.data[5],this.data[7],
				this.data[8],this.data[9],this.data[11],
				this.data[12],this.data[13],this.data[15]
			]));
			const A14=-(this.getDet([
				this.data[4],this.data[5],this.data[6],
				this.data[8],this.data[9],this.data[10],
				this.data[12],this.data[13],this.data[14]
			]));
			return A11*this.data[0]+A12*this.data[1]+A13*this.data[2]+A14*this.data[3];
		}
		else{
			if(m.length===16){
				const A11=(this.getDet([
					m[5],m[6],m[7],
					m[9],m[10],m[11],
					m[13],m[14],m[15]
				]));
				const A12=-(this.getDet([
					m[4],m[6],m[7],
					m[8],m[10],m[11],
					m[12],m[14],m[15]
				]));
				const A13=(this.getDet([
					m[4],m[5],m[7],
					m[8],m[9],m[11],
					m[12],m[13],m[15]
				]));
				const A14=-(this.getDet([
					m[4],m[5],m[6],
					m[8],m[9],m[10],
					m[12],m[13],m[14]
				]));
				return A11*m[0]+A12*m[1]+A13*m[2]+A14*m[3];
			}
			if(m.length===9){
				const A11=(this.getDet([
					m[4],m[5],
					m[7],m[8]
				]));
				const A12=-(this.getDet([
					m[3],m[5],
					m[6],m[8]
				]));
				const A13=(this.getDet([
					m[3],m[4],
					m[6],m[7]
				]));
				return A11*m[0]+A12*m[1]+A13*m[2];
			}
			if(m.length===4){
				return m[0]*m[3]-m[1]*m[2];
			}
		}
	}


	inverse(){
		const n=1/this.getDet();
		const A11=(this.getDet([
			this.data[5],this.data[6],this.data[7],
			this.data[9],this.data[10],this.data[11],
			this.data[13],this.data[14],this.data[15]
		]));
		const A12=-(this.getDet([
			this.data[4],this.data[6],this.data[7],
			this.data[8],this.data[10],this.data[11],
			this.data[12],this.data[14],this.data[15]
		]));
		const A13=(this.getDet([
			this.data[4],this.data[5],this.data[7],
			this.data[8],this.data[9],this.data[11],
			this.data[12],this.data[13],this.data[15]
		]));
		const A14=-(this.getDet([
			this.data[4],this.data[5],this.data[6],
			this.data[8],this.data[9],this.data[10],
			this.data[12],this.data[13],this.data[14]
		]));
		const A21=-(this.getDet([
			this.data[1],this.data[2],this.data[3],
			this.data[9],this.data[10],this.data[11],
			this.data[13],this.data[14],this.data[15]
		]));
		const A22=(this.getDet([
			this.data[0],this.data[2],this.data[3],
			this.data[8],this.data[10],this.data[11],
			this.data[12],this.data[14],this.data[15]
		]));
		const A23=-(this.getDet([
			this.data[0],this.data[1],this.data[3],
			this.data[8],this.data[9],this.data[11],
			this.data[12],this.data[13],this.data[15]
		]));
		const A24=(this.getDet([
			this.data[0],this.data[1],this.data[2],
			this.data[8],this.data[9],this.data[10],
			this.data[12],this.data[13],this.data[14]
		]));
		const A31=(this.getDet([
			this.data[1],this.data[2],this.data[3],
			this.data[5],this.data[6],this.data[7],
			this.data[13],this.data[14],this.data[15]
		]));
		const A32=-(this.getDet([
			this.data[0],this.data[2],this.data[3],
			this.data[4],this.data[6],this.data[7],
			this.data[12],this.data[14],this.data[15]
		]));
		const A33=(this.getDet([
			this.data[0],this.data[1],this.data[3],
			this.data[4],this.data[5],this.data[7],
			this.data[12],this.data[13],this.data[15]
		]));
		const A34=-(this.getDet([
			this.data[0],this.data[1],this.data[2],
			this.data[4],this.data[5],this.data[6],
			this.data[12],this.data[13],this.data[14]
		]));
		const A41=-(this.getDet([
			this.data[1],this.data[2],this.data[3],
			this.data[5],this.data[6],this.data[7],
			this.data[9],this.data[10],this.data[11]
		]));
		const A42=(this.getDet([
			this.data[0],this.data[2],this.data[3],
			this.data[4],this.data[6],this.data[7],
			this.data[8],this.data[10],this.data[11]
		]));
		const A43=-(this.getDet([
			this.data[0],this.data[1],this.data[3],
			this.data[4],this.data[5],this.data[7],
			this.data[8],this.data[9],this.data[11]
		]));
		const A44=(this.getDet([
			this.data[0],this.data[1],this.data[2],
			this.data[4],this.data[5],this.data[6],
			this.data[8],this.data[9],this.data[10]
		]));
		return [
			A11*n,A21*n,A31*n,A41*n,
			A12*n,A22*n,A32*n,A42*n,
			A13*n,A23*n,A33*n,A43*n,
			A14*n,A24*n,A34*n,A44*n
		];
	}
}


function drawRect(m,c,t){
	const data=[
		-50,-50,50,
		0,1,
		50,-50,50,
		1,1,
		50,50,50,
		1,0,
		50,50,50,
		1,0,
		-50,50,50,
		0,0,
		-50,-50,50,
		0,1
	];
	if(t===undefined)
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([c[0]*255,c[1]*255,c[2]*255,c[3]*255]));
	else{
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,t);
		gl.generateMipmap(gl.TEXTURE_2D);
	}
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);
	gl.vertexAttribPointer(position,3,gl.FLOAT,false,20,0);
	gl.vertexAttribPointer(tex,2,gl.FLOAT,false,20,12);
	gl.uniformMatrix4fv(matrix,false,m);
	gl.drawArrays(gl.TRIANGLES,0,data.length/5);
}


function drawCube(m,c,t){
	const data=[
		-50,-50,50,
		0,1,
		50,-50,50,
		1,1,
		50,50,50,
		1,0,
		50,50,50,
		1,0,
		-50,50,50,
		0,0,
		-50,-50,50,
		0,1,
		//
		50,-50,50,
		0,1,
		50,-50,-50,
		1,1,
		50,50,-50,
		1,0,
		50,50,-50,
		1,0,
		50,50,50,
		0,0,
		50,-50,50,
		0,1,
		//
		-50,-50,-50,
		0,1,
		-50,-50,50,
		1,1,
		-50,50,50,
		1,0,
		-50,50,50,
		1,0,
		-50,50,-50,
		0,0,
		-50,-50,-50,
		0,1,
		//
		-50,50,50,
		0,1,
		50,50,50,
		1,1,
		50,50,-50,
		1,0,
		50,50,-50,
		1,0,
		-50,50,-50,
		0,0,
		-50,50,50,
		0,1,
		//
		-50,-50,-50,
		0,1,
		50,-50,-50,
		1,1,
		50,-50,50,
		1,0,
		50,-50,50,
		1,0,
		-50,-50,50,
		0,0,
		-50,-50,-50,
		0,1,
		//
		50,-50,-50,
		0,1,
		-50,-50,-50,
		1,1,
		-50,50,-50,
		1,0,
		-50,50,-50,
		1,0,
		50,50,-50,
		0,0,
		50,-50,-50,
		0,1
	];
	if(t===undefined)
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([c[0]*255,c[1]*255,c[2]*255,c[3]*255]));
	else{
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,t);
		gl.generateMipmap(gl.TEXTURE_2D);
	}
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);
	gl.vertexAttribPointer(position,3,gl.FLOAT,false,20,0);
	gl.vertexAttribPointer(tex,2,gl.FLOAT,false,20,12);
	gl.uniformMatrix4fv(matrix,false,m);
	gl.drawArrays(gl.TRIANGLES,0,data.length/5);
}


function drawEarth(w,h,m,c,t){
	const data=[];
	for(let i=0;i<h;i++){
		const y=i*100-50;
		const height=i*100+50;
		for(let j=0;j<w;j++){
			const x=j*100-50;
			const width=j*100+50;
			data.push(
				x,y,50,
				0,1,
				width,y,50,
				1,1,
				width,height,50,
				1,0,
				width,height,50,
				1,0,
				x,height,50,
				0,0,
				x,y,50,
				0,1,
			);
		}
	}
	if(t===undefined)
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([c[0]*255,c[1]*255,c[2]*255,c[3]*255]));
	else{
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,t);
		gl.generateMipmap(gl.TEXTURE_2D);
	}
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);
	gl.vertexAttribPointer(position,3,gl.FLOAT,false,20,0);
	gl.vertexAttribPointer(tex,2,gl.FLOAT,false,20,12);
	gl.uniformMatrix4fv(matrix,false,m);
	gl.drawArrays(gl.TRIANGLES,0,data.length/5);
}


function drawCircle(s,r,m,c,t){
	const data=[];
	for(let i=0;i<360;i+=s){
		const co=Math.cos(i*Math.PI/180)*r;
		const si=Math.sin(i*Math.PI/180)*r;
		const co_=Math.cos((i+s)*Math.PI/180)*r;
		const si_=Math.sin((i+s)*Math.PI/180)*r;
		data.push(
			co,si,0,
			0,1,
			co_,si_,0,
			1,1,
			0,0,0,
			0.5,0,
		);
	}
	if(t===undefined)
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([c[0]*255,c[1]*255,c[2]*255,c[3]*255]));
	else{
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAPM_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILIER,gl.NEAREST);
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,t);
		gl.generateMipmap(gl.TEXTURE_2D);
	}
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);
	gl.vertexAttribPointer(position,3,gl.FLOAT,false,20,0);
	gl.vertexAttribPointer(tex,2,gl.FLOAT,false,20,12);
	gl.uniformMatrix4fv(matrix,false,m);
	gl.drawArrays(gl.TRIANGLES,0,data.length/5);
}


function drawCylinder(s,r,l,m,c,t){
	const data=[];
	for(let i=0;i<360;i+=s){
		const co=Math.cos(i*Math.PI/180)*r;
		const si=Math.sin(i*Math.PI/180)*r;
		const co_=Math.cos((i+s)*Math.PI/180)*r;
		const si_=Math.sin((i+s)*Math.PI/180)*r;
		data.push(
			co,si,0,
			0,1,
			co_,si_,0,
			1,1,
			co_,si_,0+l,
			1,0,
			co_,si_,0+l,
			1,0,
			co,si,0+l,
			0,0,
			co,si,0,
			0,1,
		);
	}
	if(t===undefined)
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([c[0]*255,c[1]*255,c[2]*255,c[3]*255]));
	else{
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAPM_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILIER,gl.NEAREST);
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,t);
		gl.generateMipmap(gl.TEXTURE_2D);
	}
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);
	gl.vertexAttribPointer(position,3,gl.FLOAT,false,20,0);
	gl.vertexAttribPointer(tex,2,gl.FLOAT,false,20,12);
	gl.uniformMatrix4fv(matrix,false,m);
	gl.drawArrays(gl.TRIANGLES,0,data.length/5);
}


function init(canvas){
	start=[0,0];
	rotates=[0,0];
	gl=canvas.getContext('webgl');
	const program=createProgram();
	gl.useProgram(program);
	gl.viewport(0,0,window.innerWidth,window.innerHeight);
	gl.clearColor(0,0,0,1);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	position=gl.getAttribLocation(program,'position');
	tex=gl.getAttribLocation(program,'tex');
	matrix=gl.getUniformLocation(program,'matrix');
	gl.enableVertexAttribArray(position);
	gl.enableVertexAttribArray(tex);
	const buffer=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
	const texture=gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D,texture);
	mainMatrix=new Matrix();
	mainMatrix.perspective(1,window.innerWidth/window.innerHeight,1,8000);
}


function draw(){
	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
	const camera=new Matrix();
	camera.rotate(rotates[1],rotates[0],0);
	camera.translate(0,0,1000);
	const localMatrix=new Matrix(mainMatrix.data);
	localMatrix.multiply(camera.inverse());
	drawEarth(
		5,5,
		localMatrix.multiply(
			localMatrix.rotate(-90,0,0,1),
			localMatrix.translate(-200,0,0,localMatrix.data)
		),
		[0,0.8,0.7,1]
	);
}


document.body.style.overscrollBehavior='contain';
const canvas=document.querySelector('#canvas');
canvas.setAttribute('width',window.innerWidth);
canvas.setAttribute('height',window.innerHeight);


canvas.addEventListener('touchstart',(e)=>{
	start[0]=e.touches[0].clientX;
	start[1]=e.touches[0].clientY;
});


canvas.addEventListener('touchmove',(e)=>{
	let x=start[0]-e.touches[0].clientX;
	let y=start[1]-e.touches[0].clientY;
	if(x>0&&x<40)
		x=0;
	if(x<0&&x>-40)
		x=0;
	if(y>0&&y<80)
		y=0;
	if(y<0&&y>-80)
		y=0;
	rotates[0]+=x*0.01;
	rotates[1]+=y*0.01;
	draw();
});


init(canvas);
draw();
