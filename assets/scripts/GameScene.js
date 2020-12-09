// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
      
        chessGridPrefab: {
            default: null,
            type: cc.Prefab
        },
		chessGridsNode: {
            default: null,
            type: cc.Node
        },
		chessmanPrefab: {
            default: null,
            type: cc.Prefab
        },
		chessmansNode: {
            default: null,
            type: cc.Node
        },
		currentPlayerLabel: {
            default: null,
            type: cc.Label
        },
		timeLabel: {
            default: null,
            type: cc.Label
        },
		userIdLabel: {
            default: null,
            type: cc.Label
        },
		roundLabel: {
            default: null,
            type: cc.Label
        },
		usernameLabel: {
            default: null,
            type: cc.Label
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
		this.globalNodeUser = cc.find("globalNodeUser"); //username
		this.globalNodeInfo = cc.find("globalNodeInfo");
		this.globalNodeGameInfo = new cc.Node('globalNodeGameInfo');
	    cc.game.addPersistRootNode(this.globalNodeGameInfo);
		
		this.canOperate = true;
		this.isMyRound = false;
		var self = this;
		var network = require("NetworkUtils");
		var sendData = [];
		self.usernameLabel.string = this.globalNodeUser.username;
		//gameId
		sendData["id"] = this.globalNodeInfo.id;
		network.send('chessgame/v1/game',sendData,function(res){
			console.log(res);
			var receiveObj = JSON.parse(res);
			if(receiveObj.code===200 && receiveObj.data.id!==0){
				self.globalNodeGameInfo.currentPlayer = receiveObj.data.current_player;
		        self.globalNodeGameInfo.roundNum = receiveObj.data.round;
				//
				self.globalNodeGameInfo.roundTime = receiveObj.data.round_limit_time;
				self.switchCurrentPlayer();
				self.uid1 = receiveObj.data.uid1;
		        self.uid2 = receiveObj.data.uid2;
				if(self.uid1==self.globalNodeInfo.uid){
					self.userIdLabel.string = '您是黑方';
					self.globalNodeGameInfo.userId = 0;
				}else if(self.uid2==self.globalNodeInfo.uid){
					self.userIdLabel.string = '您是红方';
					self.globalNodeGameInfo.userId = 1;
				}
				self.isMyRound = self.globalNodeGameInfo.userId == receiveObj.data.current_player;
				var chessmanIds=JSON.parse(receiveObj.data.chessboard);
				self.selectedChessGrid=null;
				self.chessGrids=new Array();
				for( var i=0;i<4;i++){
					self.chessGrids[i]=new Array();
					for(var j=0;j<8;j++){
						self.chessGrids[i][j]=cc.instantiate(self.chessGridPrefab);
						var chessGrid =self.chessGrids[i][j].getComponent('ChessGrid');
						chessGrid.setPosition(i,j);
						chessGrid.gameScene=self;
						self.chessGridsNode.addChild(self.chessGrids[i][j]);
						self.chessmanNode=cc.instantiate(self.chessmanPrefab);
						self.chessmansNode.addChild(self.chessmanNode);
						var chessman=self.chessmanNode.getComponent('Chessman');
						chessGrid.chessman=chessman;
						chessman.setGrid(chessGrid);
						chessman.setId(chessmanIds[i*8+j]);
					}
				}
			}
		},null);
		self.getOperateInfo();
		self.schedule(this.getOperateInfo,2);
	},
	gameOver: function () {
		if(this.globalNodeGameInfo.roleId==7&&this.globalNodeGameInfo.playerId==1){
			this.globalNodeWinner = new cc.Node('globalNodeWinner');
			cc.game.addPersistRootNode(this.globalNodeWinner);
			this.globalNodeWinner.info = "黑方胜利,"+"共"+this.globalNodeGameInfo.roundNum+"回合";
			this.globalNodeWinner.id = this.globalNodeInfo.id;
			cc.director.loadScene('gameOverScene');
		}else if(this.globalNodeGameInfo.roleId==7&&this.globalNodeGameInfo.playerId==0){
			this.globalNodeWinner = new cc.Node('globalNodeWinner');
			cc.game.addPersistRootNode(this.globalNodeWinner);
			this.globalNodeWinner.info = "红方胜利,"+"共"+this.globalNodeGameInfo.roundNum+"回合";
			this.globalNodeWinner.id = this.globalNodeInfo.id;
			cc.director.loadScene('gameOverScene');
		}
    },
	switchCurrentPlayer:function(){
		this.globalNodeGameInfo = cc.find("globalNodeGameInfo");
		if(this.globalNodeGameInfo.currentPlayer==0){
			this.currentPlayerLabel.string="黑方请走";
			this.roundLabel.string="第"+this.globalNodeGameInfo.roundNum+"回合";
		}else{
			this.currentPlayerLabel.string="红方请走";
			this.roundLabel.string="第"+this.globalNodeGameInfo.roundNum+"回合";
		}
	},
	// 
	onChessGridClick:function(chessGrid){
		this.globalNodeGameInfo = cc.find("globalNodeGameInfo");
		if(!this.canOperate){
			return;
		}
		if(!this.isMyRound){
			return;
		}
		var op; //当前操作
		var self=this;
		if(this.selectedChessGrid!=null){
			this.selectedChessGrid.unselected();
		//2.2
		//两次点击的是同一个格子，先判断格子是否打开，如果没有先调用open函数
		if(this.selectedChessGrid==chessGrid){
			if(chessGrid.chessman!=null && !chessGrid.chessman.isOpened()){
				this.canOperate=false;
				this.op="0";//打开棋子
				var network = require("NetworkUtils");
				var sendData = [];
				sendData['id'] = this.globalNodeInfo.id;
				sendData['op'] = this.op;
				sendData['r1'] = this.selectedChessGrid.row;
				sendData['c1'] = this.selectedChessGrid.column;
				sendData['r2'] = chessGrid.row;
				sendData['c2'] = chessGrid.column;
				sendData['current_player'] = this.globalNodeGameInfo.currentPlayer;
				sendData['round'] = this.globalNodeGameInfo.roundNum;
				
				network.send('chessgame/v1/operation',sendData,function(res){
					console.log(res);
					var receiveObj = JSON.parse(res);
					if(receiveObj.code===200 && receiveObj.data.id!==0){
						self.globalNodeGameInfo.currentPlayer = receiveObj.data.current_player;
						self.globalNodeGameInfo.roundNum = receiveObj.data.round;
						self.switchCurrentPlayer();
						self.getOperateInfo();
		                self.schedule(self.getOperateInfo,2);
					}
				},null);
				chessGrid.chessman.open(function(){
					self.canOperate=true;//恢复成原状
				});
			}else if(chessGrid.chessman!=null && chessGrid.chessman.isOpened()){
				self.canOperate=true;
			}
		}
		//相邻判断,首先出现黒，一直打开附近，如果出现红色就不能打开
		else if(this.selectedChessGrid.isNextTo(chessGrid)){
			if(this.selectedChessGrid.chessman!=null && this.selectedChessGrid.chessman.isOpened()){
				if(this.selectedChessGrid.chessman.getPlayerId()==this.globalNodeGameInfo.currentPlayer){
					if(chessGrid.chessman!=null 
						&& chessGrid.chessman.isOpened()
						&& this.selectedChessGrid.chessman.getPlayerId()!= chessGrid.chessman.getPlayerId() ){
						//如果一者的ID大于另一者，就进行攻击
							var formChessman=this.selectedChessGrid.chessman;
							var toChessman=chessGrid.chessman;
						//如果fromChessman是兵，toChessman是将，进行攻击
						//如果fromChessman>toChessman,即使toChessman大于fromChessman
						if((formChessman.getRoleId()==1 &&toChessman.getRoleId()==7)
							||((formChessman.getRoleId()>= toChessman.getRoleId())
							&&!(formChessman.getRoleId()==7 &&toChessman.getRoleId()==1)))
						{
						//将不能吃兵，兵可以吃将
						    this.canOperate=false;
						    this.op="1";//攻击
							var network = require("NetworkUtils");
							var sendData = [];
							sendData['id'] = this.globalNodeInfo.id;
							sendData['op'] = this.op;
							sendData['r1'] = this.selectedChessGrid.row;
							sendData['c1'] = this.selectedChessGrid.column;
							sendData['r2'] = chessGrid.row;
							sendData['c2'] = chessGrid.column;
							sendData['current_player'] = this.globalNodeGameInfo.currentPlayer;
				            sendData['round'] = this.globalNodeGameInfo.roundNum;
							this.globalNodeGameInfo.playerId = chessGrid.chessman.getPlayerId();
							this.globalNodeGameInfo.roleId = chessGrid.chessman.getRoleId();
							network.send('chessgame/v1/operation',sendData,function(res){
								console.log(res);
								var receiveObj = JSON.parse(res);
								if(receiveObj.code===200 && receiveObj.data.id!==0){
									self.globalNodeGameInfo.currentPlayer = receiveObj.data.current_player;
									self.globalNodeGameInfo.roundNum = receiveObj.data.round;
									self.switchCurrentPlayer();
									self.getOperateInfo();
		                            self.schedule(self.getOperateInfo,2);
									
								}
							},null);
							formChessman.attack(chessGrid,this.selectedChessGrid.getDirection(chessGrid),function(){
								self.canOperate=true;
								self.gameOver();
							});
							toChessman.beAttack(formChessman.getRoleId(),chessGrid.getDirection(this.selectedChessGrid));
							
						//如果兵攻击帅，或者帅攻击帅
						if((formChessman.getRoleId()==1 &&toChessman.getRoleId()==7)
							||(formChessman.getRoleId()==7 &&toChessman.getRoleId()==7)){
							this.op="1";//攻击
							var network = require("NetworkUtils");
							var sendData = [];
							sendData['id'] = this.globalNodeInfo.id;
							sendData['op'] = this.op;
							sendData['r1'] = this.selectedChessGrid.row;
							sendData['c1'] = this.selectedChessGrid.column;
							sendData['r2'] = chessGrid.row;
							sendData['c2'] = chessGrid.column;
							sendData['current_player'] = this.globalNodeGameInfo.currentPlayer;
				            sendData['round'] = this.globalNodeGameInfo.roundNum;
							this.globalNodeGameInfo.playerId = chessGrid.chessman.getPlayerId();
							this.globalNodeGameInfo.roleId = chessGrid.chessman.getRoleId();
							network.send('chessgame/v1/operation',sendData,function(res){
								console.log(res);
								var receiveObj = JSON.parse(res);
								if(receiveObj.code===200 && receiveObj.data.id!==0){
									self.globalNodeGameInfo.currentPlayer = receiveObj.data.current_player;
									self.globalNodeGameInfo.roundNum = receiveObj.data.round;
									self.switchCurrentPlayer();
									self.getOperateInfo();
		                            self.schedule(self.getOperateInfo,2);
								}
							},null);
							formChessman.attack(chessGrid,this.selectedChessGrid.getDirection(chessGrid),function(){
								self.canOperate=true;
								self.gameOver();
							});
							toChessman.beAttack(formChessman.getRoleId(),chessGrid.getDirection(this.selectedChessGrid));
							
						}
						chessGrid.chessman=formChessman;
						this.selectedChessGrid.chessman=null;
						}
					}
					else if(chessGrid.chessman==null){
						this.canOperate=false;
						this.op="2";//移动
						var network = require("NetworkUtils");
						var sendData = [];
						sendData['id'] = this.globalNodeInfo.id;
						sendData['op'] = this.op;
						sendData['r1'] = this.selectedChessGrid.row;
						sendData['c1'] = this.selectedChessGrid.column;
						sendData['r2'] = chessGrid.row;
						sendData['c2'] = chessGrid.column;
						sendData['current_player'] = this.globalNodeGameInfo.currentPlayer;
				        sendData['round'] = this.globalNodeGameInfo.roundNum;
						network.send('chessgame/v1/operation',sendData,function(receiveData){
							console.log(receiveData);
							var receiveObj = JSON.parse(receiveData);
							if(receiveObj.code===200 && receiveObj.data.id!==0){
								self.globalNodeGameInfo.currentPlayer = receiveObj.data.current_player;
								self.globalNodeGameInfo.roundNum = receiveObj.data.round;
								self.switchCurrentPlayer();
								self.getOperateInfo();
		                        self.schedule(self.getOperateInfo,2);
							}
						},null);
						this.selectedChessGrid.chessman.move(chessGrid,this.selectedChessGrid.getDirection(chessGrid),function(){//进行移动
							self.canOperate=true;
						});
						chessGrid.chessman=this.selectedChessGrid.chessman;
						this.selectedChessGrid.chessman=null;
						
					}
				}
			}
		}
		//两次不相邻
		//同行或同列并且攻击者是炮，被攻击者是另一方或者未翻开，并且隔着一个棋子
		//两次点击不相邻，(同行或同列)并且攻击者是炮并且（被攻击者是另一方或未翻开）并且(隔着一个棋子)
			else if((this.selectedChessGrid.row==chessGrid.row || this.selectedChessGrid.column==chessGrid.column)
				&&(this.selectedChessGrid.chessman!=null&&this.selectedChessGrid.chessman.isOpened()&&this.selectedChessGrid.chessman.getRoleId()==2)
				&&(chessGrid.chessman!=null&&(chessGrid.chessman.isOpened()
				&&this.selectedChessGrid.chessman.getPlayerId()!=chessGrid.chessman.getPlayerId())
				||(!chessGrid.chessman.isOpened()))
				&&this.getChessmanCount(this.selectedChessGrid,chessGrid)==2
				){
					if(this.selectedChessGrid.chessman.getPlayerId()==this.globalNodeGameInfo.currentPlayer){
						var fromChessman=this.selectedChessGrid.chessman;
						var toChessman=chessGrid.chessman;
						if(toChessman.isOpened()){
							this.canOperate=false;
							this.op="1";//攻击
							var network = require("NetworkUtils");
							var sendData = [];
							sendData['id'] = this.globalNodeInfo.id;
							sendData['op'] = this.op;
							sendData['r1'] = this.selectedChessGrid.row;
							sendData['c1'] = this.selectedChessGrid.column;
							sendData['r2'] = chessGrid.row;
							sendData['c2'] = chessGrid.column;
							sendData["current_player"] = this.globalNodeGameInfo.currentPlayer;
							sendData["round"] = this.globalNodeGameInfo.roundNum;
							this.globalNodeGameInfo.playerId = chessGrid.chessman.getPlayerId();
							this.globalNodeGameInfo.roleId = chessGrid.chessman.getRoleId();
							network.send('chessgame/v1/operation',sendData,function(receiveData){
									console.log(receiveData);
									var receiveObj = JSON.parse(receiveData);
									if(receiveObj.code===200 && receiveObj.data.id!==0){
										self.globalNodeGameInfo.currentPlayer = receiveObj.data.current_player;
										self.globalNodeGameInfo.roundNum = receiveObj.data.round;
										self.switchCurrentPlayer();
										self.getOperateInfo();
										self.schedule(self.getOperateInfo,2);	
									}
								},null);
							this.selectedChessGrid.chessman.attack(chessGrid,this.selectedChessGrid.getDirection(chessGrid),function(){
								self.gameOver();
								this.canOperate=true;
							}); 
							toChessman.beAttack(fromChessman.getRoleId(),chessGrid.getDirection(this.selectedChessGrid));
							chessGrid.chessman=fromChessman;
							this.selectedChessGrid.chessman=null;
						}
						
						
					}	
			}
			
		}
		this.selectedChessGrid=chessGrid;
		this.selectedChessGrid.selected();
		
	},
	
    start () {

    },

	getOperateInfo:function(){
		this.globalNodeGameInfo = cc.find("globalNodeGameInfo");
		var self=this;
		var network = require("NetworkUtils");
		var sendData = [];
		//gameId
		sendData["id"] = this.globalNodeInfo.id;
		network.send('chessgame/v1/game',sendData,function(res){
			console.log(res);
			var receiveObj = JSON.parse(res);
			if(receiveObj.code===200 && receiveObj.data.id!==0){
				self.isMyRound = self.globalNodeGameInfo.userId == receiveObj.data.current_player;
				self.globalNodeGameInfo.roundTime = receiveObj.data.round_limit_time;
				var currentTime = Math.floor(Date.parse(new Date())/1000);
				self.dt=receiveObj.server_time-currentTime;
				//self.countDown=self.globalNodeGameInfo.roundTime-self.dt-currentTime;
				self.countDown=10
				if(!self.isMyRound){
					self.canOperate = false;
				}else{
					self.globalNodeGameInfo.currentPlayer = receiveObj.data.current_player;
					self.globalNodeGameInfo.roundNum = receiveObj.data.round;
					self.selectedChessGrid=null;
					var chessGrid=null;
					if(receiveObj.data.operate!=null){
						console.log(receiveObj.data.operate);
						var operate = JSON.parse(receiveObj.data.operate);
					
						var op = operate[0];
						var fromChessRow = operate[1];
						var fromChessColumn = operate[2];
						var toChessRow = operate[3];
						var toChessColumn = operate[4];
						console.log('操作：', fromChessRow);
						console.log('操作：', fromChessColumn);
						console.log('操作：', toChessRow);
						console.log('操作：', toChessColumn);
						
						self.selectedChessGrid = self.chessGrids[fromChessRow][fromChessColumn].getComponent('ChessGrid');
						chessGrid=self.chessGrids[toChessRow][toChessColumn].getComponent('ChessGrid');
						switch(op){
							case "0"://打开
								chessGrid.chessman.open(function(){
									self.switchCurrentPlayer();
									self.canOperate=true;
								});
							break;
							case "1"://攻击
								self.selectedChessGrid.chessman.attack(chessGrid,self.selectedChessGrid.getDirection(chessGrid),function(){								
									self.canOperate = true;
									self.gameOver();
								});
								chessGrid.chessman.beAttack(self.selectedChessGrid.chessman.getRoleId(),chessGrid.getDirection(self.selectedChessGrid));
								self.switchCurrentPlayer();		
								self.globalNodeGameInfo.playerId = chessGrid.chessman.getPlayerId();
								self.globalNodeGameInfo.roleId = chessGrid.chessman.getRoleId();								
								chessGrid.chessman =self.selectedChessGrid.chessman;
								self.selectedChessGrid.chessman = null;
								
							break;
							case "2"://移动
								self.selectedChessGrid.chessman.move(chessGrid,self.selectedChessGrid.getDirection(chessGrid),function(){
									self.switchCurrentPlayer();
									self.canOperate = true;
								});
								chessGrid.chessman = self.selectedChessGrid.chessman;
								self.selectedChessGrid.chessman = null;
							break;
						}
						self.unschedule(self.getOperateInfo);
					}
				}
			}
		},null);
	},	
	
	isoverTime: function() {
	this.countDown--;
	var self = this;
	if (self.isMyRound && self.countDown == 0 && !self.isOperate) {
		var network = require("NetworkUtils");
		var sendData = [];
		sendData["id"] = self.gloabalNodeInfo.id;
		sendData["op"] = '';
		sendData["current_player"] = self.gloabalNodeGameInfo.currentPlayer;
		sendData["round"] = self.gloabalNodeGameInfo.roundNum;
		network.send('chessgame/v1/operation',sendData,function(res){
			console.log(res);
			var receiveObj = JSON.parse(res);
			if (receiveObj.code === 200 && receiveObj.data.id !== 0) {
				self.gloabalNodeGameInfo.roundTime = receiveObj.data.round_limit_time;
				//self.countDown=self.globalNodeGameInfo.roundTime-receiveObj.update_time;
				//self.schedule(self.isoverTime, 1);
				var currentTime = Math.floor(Date.parse(new Date())/1000);
				self.dt=receiveObj.server_time-currentTime;
				self.countDown=self.globalNodeGameInfo.roundTime-self.dt-currentTime;
				self.schedule(self.isOverTime,1);
				self.gloabalNodeGameInfo.currentPlayer = receiveObj.data.current_player;
				self.gloabalNodeGameInfo.roundNum = receiveObj.data.round;
				self.switchCurrentPlayer();
				self.schedule(self.getOperateInfo, 1);
		
			}
		}, null);
}
this.timeLabel.string = "倒计时：" + this.countDown;
},

	
    getChessmanCount:function(fromChessGrid,toChessGrid){//从一个格子到另一个格子
	    var temp;
		var minRow=fromChessGrid.row;
		var maxRow=toChessGrid.row;
		if(minRow>maxRow){
			temp=minRow;
			minRow=maxRow;
			maxRow=temp;			
		}
		var minColumn=fromChessGrid.column;
		var maxColumn=toChessGrid.column;
		if(minColumn>maxColumn){
			temp=minColumn;
			minColumn=maxColumn;
			maxColumn=temp;			
		}
		var count=0;
		for(var i=minRow;i<=maxRow;i++){
			for(var j=minColumn;j<=maxColumn;j++){
				var chessGrid = this.chessGrids[i][j].getComponent('ChessGrid');
				if(chessGrid.chessman!=null)
					count++;
			}
		}
		return count;
	}

    // update (dt) {},
});
