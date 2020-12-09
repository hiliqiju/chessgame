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
		confirmPwdEditBox: {
            default: null,
            type: cc.EditBox
        },
		msgLabel: {
            default: null,
            type: cc.Label
        },
    },

   onLoad(){
		var self = this;
		this.playButton.on(cc.Node.EventType.MOUSE_DOWN,function(event){
			var network = require("NetworkUtils");
			var sendData = [];
			sendData["username"] = this.usernameEditBox.string;
			sendData["password"] = this.passwordEditBox.string;
			sendData["confirm_pwd"] = this.confirmPwdEditBox.string;
			console.log(sendData);
			network.send('chessgame/v1/register',sendData,function(res){
				console.log(res);
				var data = JSON.parse(res);
				if(data.code===201){
					alert(data.msg);
					cc.director.loadScene('startScene');
				}else{
					self.msgLabel.string=data.msg;
				}
			},null);
		},this);
	},
    start () {

    },

    // update (dt) {},
});
