// pages/game/game.js
wx.cloud.init()
const db = wx.cloud.database()
var temp;
Page({
  data: {
    mystep: null,
    chessBoard: [],
    tip1: '',
    tip2: '',
    turn: 0,
    myturn: 0,
    state: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    yourroom: '',
    myroom: '',
    yourupdate: 0,
    myupdate: 0,
    gameon: 0,
    gameover: 0,
    onshow: false,
    speak: false,
    saying: '',
    myword: '',
    yourword: '',
  },
  onLoad: function (options) {
    let my_room = options.myroom;
    let your_room = options.yourroom;
    let my_turn = options.myturn;
    let _nickName = options.nickName;
    let _img = options.img;
    console.log('myroom:' + my_room + ' yourroom:' + your_room + ' myturn:' + my_turn + 'nickName:' + _nickName);
    db.collection('tic_tac_toe_room').add({
      data: {
        _id: my_room,
        gameon: false,
        if_ready: false,
        name: _nickName,
        img: _img,
        nextstep: [],
        update: 0,
        should_be: 10,
        breakup: false,
        saying: ''
      }
    })
    if (my_turn == 1) {
      db.collection('tic_tac_toe_record').add({
        data: {
          _id: my_room,
          step: [],
          name: _nickName,
          begintime: Date.now()
        }
      })
    }
    this.setData({
      user_id: options.user_id,
      myroom: my_room,
      yourroom: your_room,
      myname: _nickName,
      myimg: _img,
      myturn: my_turn,
      width: wx.getSystemInfoSync().windowWidth,
      height: wx.getSystemInfoSync().windowHeight,
      tip1: (my_turn == 1 ? '等待对方玩家准备' : '请点击棋盘任意位置进入准备状态')
    })
    //初始化棋盘
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
    this.setData({
      chessBoard: chess
    })
    /*setInterval(this.access, 1500)
    setInterval(this.update, 1500)*/
    /*var that = this;
    setTimeout(function () {
      temp = setInterval(function () {
        if (that.data.turn == that.data.myturn) {
          clearInterval(temp)
          console.log(that.data.turn + '' + that.data.myturn)
          console.log('clearInterval')
        }
        that.access();
        that.update();
      }, 1500)
    }, 5000)*/
  },

  onShow: function () {
    if (this.data.onshow == false) {
      var that = this;
      temp = setInterval(function () {
        if (that.data.turn == that.data.myturn) {
          clearInterval(temp)
          console.log(that.data.turn + '' + that.data.myturn)
          console.log('clearInterval')
        }
        that.access();
        that.update();
      }, 1500)
      console.log('ssssssssssssssssssssssssssssssssssssssss')
      this.setData({
        onshow: true
      })
    }
  },
  onHide: function () {
    console.log('hhhhhhhhhhhhhhhhhhhhhhhh')
    this.setData({
      onshow: false
    })
    clearInterval(temp)
  },
  access: function () {
    
    db.collection('tic_tac_toe_room').doc(this.data.yourroom).get({
      success: res => {
        this.setData({
          room_info: res.data
        })
        console.log('access')
      }
    })
  },
  update: function () {
    console.log('update')
    if (this.data.room_info.saying && this.data.yourword != this.data.room_info.saying) {
      this.setData({
        yourword: this.data.room_info.saying,
        myword: ''
      })
    }
    if (this.data.myturn == 2 && this.data.room_info.gameon == true) {
      this.setData({
        gameon: true,
        tip1: '游戏开始，房主先手'
      })
    }
    if (this.data.room_info.if_ready == 1 && this.data.myturn == 1 && this.data.gameon == 0) {
      this.setData({
        tip1: '对方玩家已准备，可以开始游戏'
      })
    }
    if (this.data.room_info.breakup == true) {
      wx.showModal({
        title: '对方已退出游戏',
        content: '比赛自动结束，五秒后退出房间',
        showCancel: false,
        confirmText: '确定'
      })
      if (this.data.myturn == 1) {
        db.collection('tic_tac_toe_record').doc(this.data.myroom).update({
          data: {
            endtime: Date.now()
          }
        })
      }
      clearInterval(temp)
      setTimeout(function () {
        wx.redirectTo({
          url: '../TicTacToeIndex/TicTacToeIndex'
        })
      }, 5000)
    }
    if (this.data.room_info.update != this.data.yourupdate) {
      var yourstep = this.data.room_info.nextstep
      var abso_pos = {
        x: yourstep[0] % 3 * (this.data.width / 3) + yourstep[1] % 3 * (this.data.width / 10) + this.data.width / 60 + this.data.offset_.x,
        y: Math.floor(yourstep[0] / 3) * (this.data.width / 3) + Math.floor(yourstep[1] / 3) * (this.data.width / 10) + this.data.width / 45 + this.data.offset_.y
      }
      var chesspos = 'chessBoard[' + yourstep[0] + '][' + yourstep[1] + '].pos'
      var chesstype = 'chessBoard[' + yourstep[0] + '][' + yourstep[1] + '].type'
      this.setData({
        star: abso_pos,
        [chesspos]: abso_pos,
        [chesstype]: (this.data.myturn == 1 ? 2 : 1),
        mystep: null,
        turn: this.data.myturn,
        yourupdate: this.data.room_info.update,
      })
      this.check(yourstep[0])
      //上传棋谱
      if (this.data.myturn == 1) {
        const _ = db.command
        db.collection('tic_tac_toe_record').doc(this.data.myroom).update({
          data: {
            step: _.push([(yourstep[0] + 1) * 10 + yourstep[1] + 1])
          }
        })
      }
      var that = this
      setTimeout(function () {
        that.setData({
          tip2: ((that.data.state[yourstep[1]] != 0) ? ('💡 对手下了' + (yourstep[0] + 1) + '-' + (yourstep[1] + 1) + '但' + (yourstep[1] + 1) + '号井已被占领，因此你可在任意位置落子') : ('💡 对手下了' + (yourstep[0] + 1) + '-' + (yourstep[1] + 1) + ',因此你只能在' + (yourstep[1] + 1) + '小井内的空格下棋'))
        })
      }, 500)
    }
  },
  onChessBoardTouchStart: function (e) {
    if (this.data.myturn == 2 && this.data.room_info.gameon == false) {
      var curTarget = e.currentTarget;
      var offset = {
        x: curTarget.offsetLeft,
        y: curTarget.offsetTop
      };
      this.setData({
        offset_: offset,
        tip1: '已准备，等待房主开始游戏'
      })
      db.collection('tic_tac_toe_room').doc(this.data.myroom).update({
        data: {
          if_ready: true
        }
      })
    }
    if (this.data.turn == this.data.myturn) {

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
      if (this.data.state[step.x] == 0 && (this.data.room_info.should_be == step.x || this.data.state[this.data.room_info.nextstep[1]] != 0)) {
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
            [chesstype]: this.data.myturn
          })
        }
      }

    }
  },
  begin: function () {
    if (this.data.room_info.if_ready == true) {
      db.collection('tic_tac_toe_room').doc(this.data.myroom).update({
        data: {
          gameon: true
        }
      })
      this.setData({
        turn: this.data.myturn,
        gameon: true,
        tip1: '游戏开始，您是红方，您可在任意位置落子'
      })
    }
  },
  finish: function () {
    if (this.data.turn == this.data.myturn) {
      var newupdate = this.data.myupdate + 1;
      db.collection('tic_tac_toe_room').doc(this.data.myroom).update({
        data: {
          update: newupdate,
          nextstep: [this.data.mystep.x, this.data.mystep.y],
          should_be: this.data.mystep.y
        },
        success: console.log,
        fail: console.error
      })
      if (this.data.myturn == 1) {
        const _ = db.command
        db.collection('tic_tac_toe_record').doc(this.data.myroom).update({
          data: {
            step: _.push([(this.data.mystep.x + 1) * 10 + this.data.mystep.y + 1])
          }
        })
      }
      this.setData({
        myupdate: newupdate,
        turn: (this.data.myturn == 1 ? 2 : 1)
      })
      this.check(this.data.mystep.x)
      var that = this;
      setTimeout(function () {
        that.setData({
          tip2: ((that.data.state[that.data.mystep.y] != 0) ? ('💡 你下了' + (that.data.mystep.x + 1) + '-' + (that.data.mystep.y + 1) + '但' + (that.data.mystep.y + 1) + '号井已被占领，因此对方可在任意位置落子') : ('💡 你下了' + (that.data.mystep.x + 1) + '-' + (that.data.mystep.y + 1) + ',因此对方只能在' + (that.data.mystep.y + 1) + '小井内的空格下棋'))
        })
      }, 500)
      //监控
      setTimeout(function () {
        temp = setInterval(function () {
          if (that.data.turn == that.data.myturn) {
            console.log('clearInterval')
            clearInterval(temp)
          }
          that.access();
          that.update();
        }, 1500)
      }, 5000)
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
  gameover: function (winner) {
    if (this.data.gameon == 1) {
      if (this.data.myturn == 1) {
        db.collection('tic_tac_toe_record').doc(this.data.myroom).update({
          data: {
            Winner: winner,
            endtime: Date.now()
          }
        })
      }
      this.setData({
        gameon: 0,
        turn: 0,
        gameover: 1,
        lasttip: '游戏结束,恭喜' + ((winner == this.data.myturn) ? (this.data.myname) : (this.data.room_info.name)) + '获得胜利,5秒后自动退出房间'
      })
      clearInterval(temp)
      const _ = db.command
      db.collection('tic_tac_toe').doc(this.data.user_id).update({
        data: {
          times: _.inc(1),
          wins: (winner == this.data.myturn) ? (_.inc(1)) : (_.inc(0))
        },
        success: console.log,
        fail: console.error
      })
      setTimeout(function () {
        wx.redirectTo({
          url: '../TicTacToeIndex/TicTacToeIndex'
        })
      }, 5000)
    }

  },
  back_to_index: function () {
    var that = this;
    wx.showModal({
      title: '正在游戏中',
      content: '退出将结束游戏，确定退出吗',
      showCancel: true,
      confirmText: '确定',
      cancelText: '继续游戏',
      success(res) {
        if (res.confirm) {
          db.collection('tic_tac_toe_room').doc(that.data.myroom).update({
            data: {
              breakup: true
            }
          })
          if (that.data.myturn == 1) {
            db.collection('tic_tac_toe_record').doc(that.data.myroom).update({
              data: {
                endtime: Date.now()
              }
            })
          }
          clearInterval(temp)
          wx.redirectTo({
            url: '../TicTacToeIndex/TicTacToeIndex'
          })
        }
      }
    })
  },
  speak: function () {
    this.setData({
      speak: true
    })
  },
  bindKeyInput: function (e) {
    this.setData({
      saying: e.detail.value
    })
  },
  send: function () {
    this.setData({
      speak: false,
      myword: '📢 ' + this.data.myname + ': ' + this.data.saying
    })
    db.collection('tic_tac_toe_room').doc(this.data.myroom).update({
      data: {
        saying: '📢 ' + this.data.myname + ': ' + this.data.saying
      },
      success: console.log,
      fail: console.error
    })
  }
})