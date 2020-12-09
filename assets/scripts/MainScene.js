// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        playButton: {
            default: null,
            type: cc.Node
        },
		matching: {
            default: null,
            type: cc.Node
        },
		cancelButton: {
            default: null,
            type: cc.Node
        },
		matchLabel: {
            default: null,
            type: cc.Label
        },
    },

   onLoad(){
	    this.globalNodeUser = cc.find("globalNodeUser");
		this.globalNodeInfo = new cc.Node('globalNodeInfo');
	    cc.game.addPersistRootNode(this.globalNodeInfo);
		
		this.matching.active=false;
		this.matchingAnimation=this.node.getComponent(cc.Animation);
	   
	    var self = this;
		this.playButton.on(cc.Node.EventType.MOUSE_DOWN,function(event){
			self.matching.active=true;
			self.matchingAnimation.play('matching');
			self.match();
			self.schedule(self.match,3);
		},this);
	},
	match(){
		var self = this;
		//获取username
		var username = this.globalNodeUser.username;
		var network = require("NetworkUtils");
		var sendData = [];
		sendData["token"] = this.globalNodeUser.token;
		network.send('chessgame/v1/match',sendData,function(res){
			var receiveObj = JSON.parse(res);
			console.log('匹配：', receiveObj);
			if(receiveObj.code===200 && receiveObj.data.id!==0){
				// 将gameId添加到全局节点
				self.globalNodeInfo.id=receiveObj.data.id;
				self.globalNodeInfo.uid=self.globalNodeUser.uid;
				// 停止调度器
				self.unschedule(self.match); 
				self.countDown = 10;
				self.cancelButton.active=false;
				// 
				self.schedule(self.countDownAnimation,1);
			}
		},null);
	},
	countDownAnimation(){
		this.countDown--;
		if(this.countDown===0)
			cc.director.loadScene('gameScene');
		this.matchLabel.string=this.countDown;
	},
    start () {

    },

    // update (dt) {},
});
