// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        resultLabel: {
            default: null,
            type: cc.Label
        },
		playButton: {
            default: null,
            type: cc.Node
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
		this.globalNodeWinner = cc.find("globalNodeWinner");
		this.resultLabel.string = this.globalNodeWinner.info;
		var self = this;
		self.playButton.on(cc.Node.EventType.MOUSE_DOWN,function(event){
			cc.director.loadScene('startScene');
		},self);

	},

    start () {

    },

    // update (dt) {},
});
