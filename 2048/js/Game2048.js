(function(window, document, $) {
	
	function Game2048(opt) {
		
		// id前缀prefix,以及尺寸
		var prefix=opt.prefix, len=opt.len, size=opt.size, margin=opt.margin;
		// 创建棋盘背景并初始化
		var view=new View(prefix,len,size,margin);
		view.init();
		
		//初始化棋盘
		var board=new Board(len);
		
		var score=0;
		var winNum=32;
		var isGameOver=false;
		
		//开始游戏
		function start(){
			score=0;
			view.updateScore(0);
			view.cleanNum();
			board.init();
			board.generate();
			board.generate();
			isGameOver=false;
		}
		
		//重新开始按钮的点击事件
		$('#' + prefix + '_restart').click(start);
		
		
		board.onGenerate=function(e){
			view.addNum(e.x,e.y,e.num);
		}	
		
		start();
		
		//移动棋子
		board.onMove=function(e){
			if(e.to.num > e.from.num){
				score+=e.to.num;
				view.updateScore(score);
			}
			if(e.to.num>=winNum){
				isGameOver=true;
				// setTimeout(function() {alert("您获胜了")}, 300);
				setTimeout(function(){view.win();},300);
			}
			
			view.move(e.from, e.to);
		};
		
		//如果产生移动，则触发随机生成棋子事件
		board.onMoveComplete=function(e){
			
			if(!board.canMove()){
				isGameOver=true;
				// setTimeout(function(){alert("本次得分："+score)},300);
				setTimeout(function(){ view.over(score)},300);
			}
			
			if(e.moved){
				setTimeout(function(){
					board.generate(); },200)
			}
		};
		
		//监听鼠标事件
		$(document).keydown(function(e){
			
			if(isGameOver){
				return false;
			}
			
			switch (e.which){
				case 37: board.moveLeft(); console.log("hahahha"); break;
				case 38: board.moveTop(); break;
				case 39: board.moveRight();console.log("hahahhaha"); break;
				case 40: board.moveBottom(); break;
			}
			});
	}
	
	//设置全局函数Game2048
	window['Game2048']=Game2048;
	
	})(window, document, jQuery);


//棋盘背景
function View(prefix, len, size, margin){
	
	this.prefix=prefix;
	this.len=len;
	this.size=size;
	this.margin=margin;
	
	
	//定位到元素
	this.container=$("#"+prefix+"_container");
	var containerSize= len*size +margin * (len + 1);
	//整个游戏画布的大小
	this.container.css({width: containerSize, height: containerSize});
	
	this.score=$('#'+ prefix +'_score');
	//数字单元格对象
	this.nums=[];
}
View.prototype.updateScore=function(score){
	this.score.text(score);
}

//每个格子的位置
View.prototype.getPos=function(n){
		return this.margin + n * (this.size + this.margin);
	}

View.prototype.init=function(){
	
		for(var x=0, len=this.len; x<len; ++x){
			
			for(var y=0; y<len; ++y){
				//创建小格子
				var $cell=$('<div class="'+ this.prefix + '-cell"></div>');
				//加格式并添加到html
				$cell.css(
				{
					width: this.size + 'px',
					height: this.size + 'px',
					top:this.getPos(x),
					left:this.getPos(y)
					}
				).appendTo(this.container);
			}
		}
	}

//在（x,y）处添加num
View.prototype.addNum=function(x,y,num){
	var $num =$('<div class="' + this.prefix + '-num '+ this.prefix +'-num-'+ num +'">');
	
	$num.text(num).css({
		//初始状态
		top: this.getPos(x) + parseInt(this.size/2),
		left: this.getPos(y) + parseInt(this.size/2)
		//加入到container, 通过animate进入到最终状态
	}).appendTo(this.container).animate({
		width: this.size +'px', height: this.size+'px',
		lineHeight: this.size+'px',
		top: this.getPos(x), left:this.getPos(y)
	},100);
	
	//
	this.nums[x + '-' + y]=$num;
}

//棋盘对象
function Board(len){
	
	this.len=len;
	//二维棋盘数组
	this.arr=[];
}

//棋盘初始化，全0
Board.prototype.init=function(){
	
	// 初始化值全为0的二维数组
	for(var arr=[], len=this.len, x=0; x<len; ++x){
		arr[x]=[];
		for(var y=0; y<len; ++y){
			arr[x][y]=0;
		}
	}
	this.arr=arr;
}

//在为0的区域生成一个随机值 2 4
Board.prototype.generate=function(){
	//收集值arr中值为0的棋块的坐标
	var empty=[];
	for(var x=0, arr=this.arr, len=arr.length; x<len; ++x){
		for(var y=0; y<len; ++y){
			if(arr[x][y]===0){
				empty.push({x:x, y:y})
			}
		}
	}
	// console.log(empty)
	//满了的情况，直接返回
	if(empty.length<1){
		return false;
	}
	
	//在empty中随机拿出一个位置，随机填入 2或4
	var pos =empty[Math.floor((Math.random()*empty.length))];
	this.arr[pos.x][pos.y]=Math.random()<0.5?2:4;
	
	//触发，在棋盘上改变
	this.onGenerate({x:pos.x, y:pos.y, num:this.arr[pos.x][pos.y]});
}

Board.prototype.onGenerate=function(){
	
}

Board.prototype.moveBottom=function(){
	var moved=false;
	
	var len=this.arr.length;
	arr=this.arr;
	for(var x=0; x<len; x++){
		
		for(var y=len-1; y>=0; y--){
			
			for(var next=y-1; next>=0; next--){
				
				if(arr[next][x]===0){
					continue;
				}
				//0X:直接将X移到0
				if(arr[y][x]===0){
					
					arr[y][x]=arr[next][x];
					this.onMove({
						from:{ x: next, y: x, num: arr[next][x]},
						to:{x: y, y: x, num: arr[y][x]}
					});
					
					arr[next][x]=0;
					moved=true;
					//--y ++y 原位置不动
					++y;
				}	
				//XX:合并
				else if(arr[y][x]===arr[next][x]){
					arr[y][x]*=2;
					//从(x,next)->(x,y)
					//此时合并或移动导致的数组已经发生改变
					this.onMove({
						from:{ x: next, y:x, num: arr[next][x]},
						to:{x: y, y: x, num: arr[y][x]}
					});
					
					arr[next][x]=0;
					moved=true;				
				}				
				break;
			}
		}
	}
	
	
	this.onMoveComplete({moved:moved});
	
}

//游戏是否结束，当前是否为0，或者下边或者右边是否相等
Board.prototype.canMove=function(){
	var arr=this.arr;
	var len= this.arr.length;
	
	for(var x=0; x<len; x++){
		
		for(var y=0; y<len; y++){
			
			if(arr[x][y]===0){
				return true;
			}
			
			var curr=arr[x][y];
			var right=arr[x][y+1];
			var down=arr[x+1] ?arr[x+1][y]:null;
			
			if(down==curr || right==curr){
				return true;
			}
			
		}
	}
	
	return false;
}

//上移
Board.prototype.moveTop=function(){
	
	var moved=false;
	var len=this.arr.length;
	arr=this.arr;
	for(var x=0; x<len; x++){
		
		for(var y=0; y<len; y++){
			
			for(var next=y+1; next<len; next++){
				
				if(arr[next][x]===0){
					continue;
				}
				//0X:直接将X移到0
				if(arr[y][x]===0){
					
					arr[y][x]=arr[next][x];
					this.onMove({
						from:{ x: next, y: x, num: arr[next][x]},
						to:{x: y, y: x, num: arr[y][x]}
					});
					
					arr[next][x]=0;
					moved=true;
					//--y ++y 原位置不动
					--y;
				}	
				//XX:合并
				else if(arr[y][x]===arr[next][x]){
					arr[y][x]*=2;
					//从(x,next)->(x,y)
					//此时合并或移动导致的数组已经发生改变
					this.onMove({
						from:{ x: next, y:x, num: arr[next][x]},
						to:{x: y, y: x, num: arr[y][x]}
					});
					
					arr[next][x]=0;
					moved=true;				
				}				
				break;
			}
		}
	}
	
	this.onMoveComplete({moved:moved});
	
}

//向右移动
Board.prototype.moveRight=function(){
	var moved= false;
	
	var len=this.arr.length;
	
	for(var x=0; x<len; x++){
		var arr=this.arr[x];
		
		for(var y=len-1; y>=0; y--){
			
			for(var next=y-1; next>=0; next--){
				
				if(arr[next]===0){
					continue;
				}
				//0X:直接将X移到0
				if(arr[y]===0){
					
					arr[y]=arr[next];
					//从(x,next)->(x,y)
					//此时合并或移动导致的数组已经发生改变
					this.onMove({
						from:{ x: x, y: next, num: arr[next]},
						to:{x: x, y: y, num: arr[y]}
					});
					
					arr[next]=0;
					moved=true;
					//--y ++y 原位置不动
					++y;
				}	
				//XX:合并
				else if(arr[y]===arr[next]){
					arr[y]*=2;
					//从(x,next)->(x,y)
					//此时合并或移动导致的数组已经发生改变
					this.onMove({
						from:{ x: x, y:next, num: arr[next]},
						to:{x: x, y: y, num: arr[y]}
					});
					
					arr[next]=0;
					moved=true;				
				}				
				break;
			}
		}
	}
	this.onMoveComplete({moved:moved});
}

//向左移动
Board.prototype.moveLeft=function(){
	//是否移动
	var moved=false;
	//算法
	var len=this.arr.length;
	for(var x=0;x<len; x++){
		var arr=this.arr[x];
		for(var y=0; y<len; ++y){
			
			// arr[0][1] : arr[0][0]
			for(var next=y+1; next<len; ++next){
				//
				if(arr[next]===0){
					continue;
				}
				//0X:直接将X移到0
				if(arr[y]===0){
					
					arr[y]=arr[next];
					//从(x,next)->(x,y)
					//此时合并或移动导致的数组已经发生改变
					this.onMove({
						from:{ x: x, y: next, num: arr[next]},
						to:{x: x, y: y, num: arr[y]}
					});
					
					arr[next]=0;
					moved=true;
					//--y ++y 原位置不动
					--y;
				}	
				//XX:合并
				else if(arr[y]===arr[next]){
					arr[y]*=2;
					//从(x,next)->(x,y)
					//此时合并或移动导致的数组已经发生改变
					this.onMove({
						from:{ x: x, y:next, num: arr[next]},
						to:{x: x, y: y, num: arr[y]}
					});
					
					arr[next]=0;
					moved=true;				
				}				
				break;
			}
		}
	}
	
	this.onMoveComplete({moved:moved});
}


Board.prototype.onMove=function(e){
}
Board.prototype.onMoveComplete=function(){
}


//在背景上移动棋子
View.prototype.move=function(from,to){
	
	//nums[fromIndex] nums[toIndex]
	var fromIndex=from.x + '-' + from.y;//0-1
	var toIndex = to.x + '-' +to.y;//0-0
	
	//to将被清除
	var clean =this.nums[toIndex];
	
	//移动 from 到 to
	this.nums[toIndex]=this.nums[fromIndex];
	delete this.nums[fromIndex];

	var prefix=this.prefix+'-num-';
	//计算to的位置
	var pos={top:this.getPos(to.x), left: this.getPos(to.y)};
	
	//在棋盘上更新，并产生动画
	this.nums[toIndex].finish().animate(pos, 200, function(){
		//如果to.num>from.num表示产生了合并操作，就要，改变背景颜色
		if(to.num > from.num){
			//删除toindex,不删会覆盖，但是占空间
			clean.remove();
			//换背景色,换数字to.num
			$(this).text(to.num).removeClass(prefix + from.num).addClass(prefix + to.num);
		}
	});
}

//提示获胜
View.prototype.win=function(){
	$('#'+this.prefix+'_over_info').html('<p>您获胜了</p>')
	$('#'+this.prefix+'_over').removeClass(this.prefix+'_hide');
}

//提示游戏结束
View.prototype.over=function(score){
	$('#'+this.prefix + '_over_info').html('<p>本次得分</p><p>'+score+"</p>");
	$('#'+this.prefix+'_over').removeClass(this.prefix+'_hide');
}


//重新开始，情况游戏记录
View.prototype.cleanNum=function(){
	
	this.nums={};
	$("#"+this.prefix +'_over').addClass(this.prefix+'_hide');
	$('.'+this.prefix +'-num').remove();
}