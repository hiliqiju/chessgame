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
		usernameEditBox: {
            default: null,
            type: cc.EditBox
        },
		passwordEditBox: {
            default: null,
            type: cc.EditBox
        },
		msgLabel: {
            default: null,
            type: cc.Label
        },
		registButton: {
            default: null,
            type: cc.Node
        },
    },

   onLoad(){
	   this.globalNodeUser = new cc.Node('globalNodeUser');
	   cc.game.addPersistRootNode(this.globalNodeUser);
	   
		var self = this;
		this.playButton.on(cc.Node.EventType.MOUSE_DOWN,function(event){
			var network = require("NetworkUtils");
			var sendData = [];
			sendData["username"] = this.usernameEditBox.string;
			sendData["password"] = this.passwordEditBox.string;
			network.send('chessgame/v1/login',sendData,function(res){
				//console.log(res);
				var receiverObj = JSON.parse(res);
				if(receiverObj.code===200){
					self.globalNodeUser.token=receiverObj.token;
					self.globalNodeUser.username=receiverObj.data.username;
					self.globalNodeUser.uid = receiverObj.data.id;
					cc.director.loadScene('mainScene');
				}else{
					self.msgLabel.string=receiverObj.msg;
				}
			},null);
		},this);
		this.registButton.on(cc.Node.EventType.MOUSE_DOWN,function(event){
			cc.director.loadScene('registScene');
		},this);
	},
    start () {

    },

    // update (dt) {},
});
