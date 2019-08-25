import HMI from '/../HMI';

wx.cloud.init()
const db = wx.cloud.database()
var temp;

Page({
  data: {
    gameon:0
  },
  onLoad: function(options) {
    if (options.img == "undefined") options.img ="../../../images/user-unlogin.png"
    if (options.name == "undefined") options.name="未授权用户"
    this.setData({
      width: wx.getSystemInfoSync().windowWidth,
      name:options.name,
      img:options.img ,
      id:options.id
    })
  },
  onChessBoardTouchStart: function(e) {
    if (this.data.gameon==1) {
      var curTarget = e.currentTarget;
      var offset = {
        x: curTarget.offsetLeft,
        y: curTarget.offsetTop
      };
      this.setData({
        offset_: offset
      })
      var touch = e.touches[0];
      var clientPos = {
        x: touch.pageX - offset.x,
        y: touch.pageY - offset.y
      };
      var steppos = {
        x: Math.ceil(clientPos.x / (this.data.width / 9.0)),
        y: Math.ceil(clientPos.y / (this.data.width / 9.0))
      };
      var abso_pos = {
        x: Math.floor((steppos.x - 1) / 3) * this.data.width / 3 + (steppos.x - 1) % 3 * this.data.width / 10 + this.data.width / 60 + offset.x,
        y: Math.floor((steppos.y - 1) / 3) * this.data.width / 3 + (steppos.y - 1) % 3 * this.data.width / 10 + this.data.width / 45 + offset.y
      }
      var step = {
        x: Math.floor((steppos.y - 1) / 3) * 3 + Math.floor((steppos.x - 1) / 3 + 1) - 1,
        y: Math.floor((steppos.y - 1) % 3) * 3 + Math.floor((steppos.x - 1) % 3)
      }
      console.log(step)
      if (this.data.state[step.x] == 0 && (this.data.should_be == step.x ||this.data.state[this.data.should_be]>0|| this.data.should_be == 10)) {
        if (this.data.chessBoard[step.x][step.y].type == 0) {
          if (this.data.mystep) {
            var pre_chesstype = 'chessBoard[' + this.data.mystep.x + '][' + this.data.mystep.y + '].type'
            this.setData({
              [pre_chesstype]: 0
            })
          }
          var chesspos = 'chessBoard[' + step.x + '][' + step.y + '].pos'
          var chesstype = 'chessBoard[' + step.x + '][' + step.y + '].type'
          this.setData({
            mystep: step,
            [chesspos]: abso_pos,
            [chesstype]: 1
          })
        }
      }
    }
  },
  finish:function(){
    this.check(this.data.mystep.x);
    var that=this;
    setTimeout(function(){
      if(that.data.gameon==1){
        that.robot()
      }
    },500)
  },
  robot:function(){
    var step = this.hmi.putchess(this.data.mystep.x, this.data.mystep.y);
    if (step > 0) {
      var AIstep = [Math.floor(step / 10) - 1, step % 10 - 1];
      console.log(AIstep);
      var abso_pos = {
        x: AIstep[0] % 3 * (this.data.width / 3) + AIstep[1] % 3 * (this.data.width / 10) + this.data.width / 60 + this.data.offset_.x,
        y: Math.floor(AIstep[0] / 3) * (this.data.width / 3) + Math.floor(AIstep[1] / 3) * (this.data.width / 10) + this.data.width / 45 + this.data.offset_.y
      }
      var chesspos = 'chessBoard[' + AIstep[0] + '][' + AIstep[1] + '].pos'
      var chesstype = 'chessBoard[' + AIstep[0] + '][' + AIstep[1] + '].type'
      this.setData({
        star: abso_pos,
        should_be: AIstep[1],
        mystep: null,
        [chesspos]: abso_pos,
        [chesstype]: 2,
        tip: ((this.data.state[AIstep[1]] != 0) ? ('机器人下了' + (AIstep[0] + 1) + '-' + (AIstep[1] + 1) + '但' + (AIstep[1] + 1) + '号井已被占领，因此你可在任意位置落子') : ('机器人下了' + (AIstep[0] + 1) + '-' + (AIstep[1] + 1) + ',因此你只能在' + (AIstep[1] + 1) + '小井内的空格下棋'))
      })
      this.check(AIstep[0]);
    }
  },
  check: function (i) {
    //直线
    for (var j = 0; j < 3; j++) {
      if (this.data.chessBoard[i][j * 3].type == this.data.chessBoard[i][j * 3 + 1].type && this.data.chessBoard[i][j * 3].type == this.data.chessBoard[i][j * 3 + 2].type && this.data.chessBoard[i][j * 3].type != 0) {
        var win = 'state[' + i + ']'
        this.setData({
          [win]: this.data.chessBoard[i][j * 3].type
        })
      }
      if (this.data.chessBoard[i][j].type == this.data.chessBoard[i][j + 3].type && this.data.chessBoard[i][j].type == this.data.chessBoard[i][j + 6].type && this.data.chessBoard[i][j].type != 0) {
        var win = 'state[' + i + ']'
        this.setData({
          [win]: this.data.chessBoard[i][j].type
        })
      }
    }
    //对角线
    if ((this.data.chessBoard[i][0].type == this.data.chessBoard[i][4].type && this.data.chessBoard[i][0].type == this.data.chessBoard[i][8].type && this.data.chessBoard[i][0].type != 0) || (this.data.chessBoard[i][2].type == this.data.chessBoard[i][4].type && this.data.chessBoard[i][2].type == this.data.chessBoard[i][6].type && this.data.chessBoard[i][2].type != 0)) {
      var win = 'state[' + i + ']'
      this.setData({
        [win]: this.data.chessBoard[i][4].type
      })
    }
    var that = this;
    setTimeout(that.check_all, 500)
  },
  check_all: function () {
    if (this.data.state[0] != 0) {
      if ((this.data.state[0] == this.data.state[1] && this.data.state[0] == this.data.state[2]) ||
        (this.data.state[0] == this.data.state[3] && this.data.state[0] == this.data.state[6]) ||
        (this.data.state[0] == this.data.state[4] && this.data.state[0] == this.data.state[8])) {
        this.gameover(this.data.state[0])
      }
    }
    if (this.data.state[4] != 0) {
      if ((this.data.state[4] == this.data.state[1] && this.data.state[4] == this.data.state[7]) ||
        (this.data.state[4] == this.data.state[3] && this.data.state[4] == this.data.state[5]) ||
        (this.data.state[4] == this.data.state[2] && this.data.state[4] == this.data.state[6])) {
        this.gameover(this.data.state[4])
      }
    }
    if (this.data.state[8] != 0) {
      if ((this.data.state[8] == this.data.state[2] && this.data.state[8] == this.data.state[5]) ||
        (this.data.state[8] == this.data.state[6] && this.data.state[8] == this.data.state[7])) {
        this.gameover(this.data.state[8])
      }
    }
  },
  back_to_index:function(){
    if(this.data.gameon==1){
      wx.showModal({
        title: '游戏正在进行中',
        content: '退出将结束游戏，确定退出吗',
        showCancel: true,
        confirmText: '确定',
        cancelText: '继续游戏',
        success(res) {
          if (res.confirm) {
            wx.redirectTo({
              url: '../TicTacToeIndex/TicTacToeIndex',
            })
          }
        }
      })
    }else{
      wx.redirectTo({
        url: '../TicTacToeIndex/TicTacToeIndex',
      })
    }
  },
  start:function(){
    var chess = [];
    for (var r = 0; r < 9; r++) {
      var row = [];
      for (var c = 0; c < 9; c++) {
        row.push({
          type: 0,
          pos: null
        });
      }
      chess.push(row);
    }
    this.hmi = new HMI();
    this.setData({
      'hmi': this.hmi,
      chessBoard: chess,
      tip: '游戏开始，你是红方，先手，第一步棋可在棋盘任意位置落子',
      mystep: null,
      should_be: 10,
      state: [0, 0, 0, 0, 0, 0, 0, 0, 0],
      gameon:1
    })
  },
  restart:function(){
    var that=this;
    wx.showModal({
      title: '是否确定重新开始',
      content: '当前棋盘将被清空，确定重新开始吗？',
      showCancel: true,
      confirmText: '确定',
      cancelText: '继续游戏',
      success(res) {
        if (res.confirm){
          that.start();
        }
      }
    })
  },
  gameover:function(winner){
    if(this.data.gameon==1){
      this.setData({
        tip: '游戏结束，' + (winner == 1 ? '恭喜你' : '很遗憾，再挑战一次吧'),
        gameon: 0
      })
      const _ = db.command
      db.collection('HMI').add({
        data: {
          win: (winner == 1) ? 1:0,
          name:this.data.name,
          img:this.data.img
        },
        success:function(){
          console.log('success');
        },
        fail:function(){
          console.log('fail')
        }
      })
      db.collection('HMI_record').doc(this.data.id).update({
        data:{
          win: (winner == 1) ? (_.inc(1)) : (_.inc(0)),
          times: _.inc(1)
        }
      })
    }
  },
  torank:function(){
    wx.navigateTo({
      url: '../TicTacToeRank/TicTacToeRank',
    })
  }
})