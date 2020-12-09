// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        image:{
            default:null,
            type: cc.Node

        },
    },
    setId: function(id){
        //id:XYZ 三位整数。
        // X：打开与否 ，0是未打开，1是已打开 
        //Y：代表属于哪个玩家，0是黑，1是红
        //Z：代表哪一个棋子，1是兵，2是炮，3是车，4是马，5是象，6是士，7是将
        this.id=id;
    },
    getRoleId:function(){
        return this.id%10;
    },
    getPlayerId:function(){
        return Math.floor(this.id/10)%10;
    },
    isOpened:function(){
        return  Math.floor(this.id/100)==1;
    },
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    playAnimation:function(callback){
		var self=this;
		var count=0;
		this.schedule(function(){
			self.image.x=count*(-70);
			count++;
            if(count==16&&callback!=null)
                callback();
		},0.1,15);	
    },
    setRole:function(playerId,roleId){
        var self= this;
        cc.loader.loadRes("chessman/"+playerId+roleId,cc.SpriteFrame,function(err,spriteFrame){
            self.image.getComponent(cc.Sprite).spriteFrame=spriteFrame;
            self.image.x=0;
            self.image.y=0;
        });
    },
    open:function(callback){
        var self= this;
        this.playAnimation(function(){
            cc.loader.loadRes("chessman/"+self.getPlayerId()+self.getRoleId(),cc.SpriteFrame,function(err,spriteFrame){
                self.image.getComponent(cc.Sprite).spriteFrame=spriteFrame;
                self.image.x=0;
                self.image.y=0; 
                self.id+=100;
                if(callback!=null)
                    callback();
            });
        });
    },
    setGrid:function (chessGrid){
        this.node.x=chessGrid.node.x-this.node.width/2;
        this.node.y=chessGrid.node.y+this.node.height/2;
    },
	attack:function(chessGrid,direction,callback){
		var self=this;
		this.image.y=(1+direction)*80;
		this.playAnimation(function(){
		self.move(chessGrid,direction,callback);
		});
	},
	beAttack:function(role,direction,callback){
		this.image.y=(9+(role-1)*4+direction)*80;
		this.playAnimation(callback);
	},
	move:function(chessGrid,direction,callback){
		this.image.y=(5+direction)*80;
		var self=this;
		this.playAnimation(function(){
			self.image.x=0;
			self.image.y=0;
			if(callback!=null)
			callback();
		});
		var action=cc.moveTo(3,chessGrid.node.x-this.node.width/2,chessGrid.node.y+this.node.height/2);
		this.node.runAction(action);
	},
    start () {

    },

    // update (dt) {},
});
