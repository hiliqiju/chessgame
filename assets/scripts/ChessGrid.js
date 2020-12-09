// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        background:{
            default:null,
            type: cc.Node

        },
    },
    setPosition:function(row,column){
        this.row=row;
        this.column=column;
        this.node.y=-row*85+150;
        this.node.x=column*85-300;
    },//设置每个格子的位置
	isNextTo:function(chessGrid){
		//行相同的情况
		if(this.row==chessGrid.row&&Math.abs(this.column-chessGrid.column)==1)
			return true;
		//列相同的情况
		if(this.column==chessGrid.column&&Math.abs(this.row-chessGrid.row)==1)
			return true;
		return false;
	},
	getDirection :function(chessGrid){
		if(this.row==chessGrid.row){
			if(this.column>chessGrid.column)
				return 2;
			else
				return 3;
		}
		if(this.row>chessGrid.row)
			return 1;
		else
			return 0;
	},
    onLoad () {
        this.node.on('click',this.onClick,this);
    },
    onClick:function(button){
		this.gameScene.onChessGridClick(this);
    },
    selected : function(){
        this.background.opacity=255;//设置选择时的透明度
    },
    unselected : function(){
        this.background.opacity=120;//设置没有选择时的透明度
    },

    start () {

    },

    // update (dt) {},
});

