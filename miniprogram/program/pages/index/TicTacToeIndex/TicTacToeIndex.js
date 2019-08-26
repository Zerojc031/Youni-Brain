//index.js
//获取应用实例
const app = getApp()
wx.cloud.init()
const db = wx.cloud.database()
Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    accessable: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    imgUrls: [
      'cloud://kungfuteapanda-j6pl1.6b75-kungfuteapanda-j6pl1/images/TicTacToeCourse/1.png',
      'cloud://kungfuteapanda-j6pl1.6b75-kungfuteapanda-j6pl1/images/TicTacToeCourse/2.jpg',
      'cloud://kungfuteapanda-j6pl1.6b75-kungfuteapanda-j6pl1/images/TicTacToeCourse/3.png',
      'cloud://kungfuteapanda-j6pl1.6b75-kungfuteapanda-j6pl1/images/TicTacToeCourse/4.jpg',
      'cloud://kungfuteapanda-j6pl1.6b75-kungfuteapanda-j6pl1/images/TicTacToeCourse/5.png',
      'cloud://kungfuteapanda-j6pl1.6b75-kungfuteapanda-j6pl1/images/TicTacToeCourse/6.png',
      'cloud://kungfuteapanda-j6pl1.6b75-kungfuteapanda-j6pl1/images/TicTacToeCourse/7.png'
    ],
    tip: [
      '九个井按顺序标记为1~9，每个井的九个格按顺序标记为1~9，第五个井的第五个格序号为5-5。',
      '💡任意棋：游戏开始，房主先手任意棋。',
      '💡限定棋：玩家一下了6-1，因此玩家二只能在1号井内的空格下棋。',
      '💡限定棋： 玩家二下了1-4，因此玩家一只能在4号井内的空格下棋。',
      '💡占领：若一方在某号井内三个棋连成一条线，则该格被其占领，本局双方不可在此井下棋。',
      '💡任意棋：若玩家本轮限定下的井被占领或填满，则玩家获得任意棋。',
      '💡胜利：一方占领的井有三个连成一条直线时则获得胜利。'
    ]
  },
  //事件处理函数
  onLoad: function(options) {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true,
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true,
          })
        }
      })
    }
    setTimeout(this.generate_id, 500)
    var invited = options.invited || 0;
    if (invited == 1) {
      if (this.data.userInfo) wx.showModal({
        title: '请授权获取用户信息',
        content: '仅获取您的头像昵称，用于游戏界面的展示，可以先阅读完规则再授权，授权后立即进入房间',
        confirmText: '确定',
        showCancel: false
      })
      var that = this;
      var myroom = options.myroom;
      var yourroom = options.yourroom;

      /*var i = setInterval(function () {
        if (that.data.userInfo.nickName) {
          wx.navigateTo({
            url: '/pages/game/game?myroom=' + myroom + '&yourroom=' + yourroom + '&myturn=2&nickName=' + that.data.userInfo.nickName + '&img=' + that.data.userInfo.avatarUrl,
          })
          clearInterval(i);
        }
      }, 1000)*/
      /*db.collection('tic_tac_toe_room').doc(yourroom).get({
        success: res => {
          let info=res.data;
          if(info.name==that.data.userInfo.nickName){
            wx.navigateTo({
              url: '/pages/game/game?myroom=' + yourroom + '&yourroom=' + myroom + '&myturn=1&nickName=' + that.data.userInfo.nickName + '&img=' + that.data.userInfo.avatarUrl,
            })
          } else if (info.name != that.data.userInfo.nickName){
            var i = setInterval(function () {
              if (that.data.userInfo.nickName) {
                wx.navigateTo({
                  url: '/pages/game/game?myroom=' + myroom + '&yourroom=' + yourroom + '&myturn=2&nickName=' + that.data.userInfo.nickName + '&img=' + that.data.userInfo.avatarUrl,
                })
                clearInterval(i);
              }
            }, 1000)
          }
        }
      })*/

      db.collection('tic_tac_toe_room').doc(yourroom).get({
        success: res => {
          let info = res.data;
          if (info.name == that.data.userInfo.nickName) {
            wx.redirectTo({
              url: '../TicTacToeGame/TicTacToeGame?myroom=' + yourroom + '&yourroom=' + myroom + '&myturn=1&nickName=' + that.data.userInfo.nickName + '&img=' + that.data.userInfo.avatarUrl + '&user_id=' + that.data.user_id,
            })
          } else if (info.name != that.data.userInfo.nickName) {
            db.collection('tic_tac_toe_room').doc(myroom).get({
              success: res => {
                let info1 = res.data;
                if (info1.name == that.data.userInfo.nickName) {
                  wx.redirectTo({
                    url: '../TicTacToeGame/TicTacToeGame?myroom=' + myroom + '&yourroom=' + yourroom + '&myturn=2&nickName=' + that.data.userInfo.nickName + '&img=' + that.data.userInfo.avatarUrl + '&user_id=' + that.data.user_id,
                  })
                } else {
                  wx.showModal({
                    title: '游戏已开始',
                    content: '',
                    showCancel: false,
                    confirmText: '确定'
                  })
                }
              },
              fail: function() {
                var i = setInterval(function() {
                  if (that.data.userInfo.nickName && that.data.user_id) {
                    wx.redirectTo({
                      url: '../TicTacToeGame/TicTacToeGame?myroom=' + myroom + '&yourroom=' + yourroom + '&myturn=2&nickName=' + that.data.userInfo.nickName + '&img=' + that.data.userInfo.avatarUrl + '&user_id=' + that.data.user_id,
                    })
                    clearInterval(i);
                  }
                }, 1000)
              }
            })
          }
        }
      })
    }
  },

  onReady: function() {
    var that = this
    if (app.globalData.userInfo) {
      console.log('进行查询数据库操作')
      db.collection('control').doc('database').get({
        success: function(res) {
          console.log('查询数据库control成功', res)
          if (res.data.accessable && !that.data.accessable) that.setData({
            accessable: res.data.accessable
          })
        },
        fail: function(res) {
          console.log('查询数据库control失败',res)
        },
        complete: function(res) {
          console.log('查询数据库control完成', res)
          if (res.data.accessable && !that.data.accessable) that.setData({
            accessable: res.data.accessable
          })
        }
      })
    } else {
      console.log('无授权数据')
    }
  },

  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true,
    })
  },

  onShareAppMessage: function() {
    let that = this;
    var room1 = (Math.random() * 10000000).toString(16).substr(0, 4) + '-' + (new Date()).getTime() + '-' + Math.random().toString().substr(2, 5);
    var room2 = (Math.random() * 10000000).toString(16).substr(0, 4) + '-' + (new Date()).getTime() + '-' + Math.random().toString().substr(2, 5);
    setTimeout(function() {
      wx.redirectTo({
        url: '../TicTacToeGame/TicTacToeGame?myroom=' + room1 + '&yourroom=' + room2 + '&myturn=1&nickName=' + that.data.userInfo.nickName + '&img=' + that.data.userInfo.avatarUrl + '&user_id=' + that.data.user_id,
      })
    }, 2000)
    return {
      title: that.data.userInfo.nickName + '邀请你加入游戏',
      path: '/pages/index/TicTacToeIndex/TicTacToeIndex?myroom=' + room2 + '&yourroom=' + room1 + '&invited=1',
      success: (res) => {
        console.log('successfully shared');
      }
    }
  },

  /*generate_id: function () {
    try {
      var value_id = wx.getStorageSync('tic-tac-toe-id')
      if (value_id) {
        this.setData({
          user_id: value_id
        })
        db.collection('tic_tac_toe').doc(value_id).get({
          success:res=>{
            if(!res.data.times_HMI){
              console.log('hello');
              var wintemp=0;
              var peacetemp=0;
              var timestemp=0;
              //胜局
              db.collection('HMI').where({
                name: this.data.userInfo.nickName,
                win: 1
              }).get({
                success: res => {
                  wintemp=res.data.length
                },
                fail: console.error
              })
              //总局数
              db.collection('HMI').where({
                name: this.data.userInfo.nickName
              }).get({
                success: res => {
                  timestemp = res.data.length
                },
                fail: console.error
              })
              //平局
              db.collection('HMI').where({
                name: this.data.userInfo.nickName,
                win:2                           
              }).get({
                success: res => {
                  peacetemp = res.data.length
                },
                fail: console.error
              })
              //上传
              var that=this;
              setTimeout(function(){
                db.collection('tic_tac_toe').doc(value_id).update({
                  data: {
                    username: that.data.userInfo.nickName,
                    userimg: that.data.userInfo.avatarUrl,
                    gender: that.data.userInfo.gender,
                    win_HMI: wintemp,
                    peace_HMI: peacetemp,
                    times_HMI: timestemp
                  },
                  success: function (res) {
                    console.log(res)
                  }
                })
              },500)
            }
          }
        })
      }
      else {
        var temp = (Math.random() * 10000000).toString(16).substr(0, 4) + '-' + (new Date()).getTime() + '-' + Math.random().toString().substr(2, 5)
        this.setData({
          user_id: temp
        })
        wx.setStorage({
          key: 'tic-tac-toe-id',
          data: temp,
        })
        console.log(this.data.userInfo.nickName + '' + this.data.userInfo.avatarUrl)
        db.collection('tic_tac_toe').add({
          data: {
            times: new Number(0),
            wins: new Number(0),
            _id: temp,
            username: this.data.userInfo.nickName,
            userimg: this.data.userInfo.avatarUrl,
            gender: this.data.userInfo.gender,
            win_HMI:0,
            peace_HMI:0,
            times_HMI:0
          },
          success: function (res) {
            console.log(res)
          }
        })
      }
    } catch (e) {
      console.log(e)
    }
  },*/

  generate_id: function() {
    try {
      var value_id = wx.getStorageSync('tic-tac-toe-id');
      if (value_id) {
        this.data.user_id = value_id
      } else {
        var temp = (Math.random() * 10000000).toString(16).substr(0, 4) + '-' + (new Date()).getTime() + '-' + Math.random().toString().substr(2, 5)
        this.data.user_id = temp
        wx.setStorage({
          key: 'tic-tac-toe-id',
          data: temp,
        })
      }
      var that = this;
      setTimeout(that.record, 500)
    } catch (e) {
      console.log(e)
    }
  },

  record: function() {
    var flag = 0;
    db.collection('HMI_record').doc(this.data.user_id).get({
      success: res => {
        console.log(res.data)
        flag = 1;
      },
      fail: function() {
        flag = 2;
      }
    })
    var that = this;
    setTimeout(function() {
      console.log('flag:' + flag);
      if (flag == 2) {
        var wintemp = 0;
        var peacetemp = 0;
        var timestemp = 0;
        //胜局
        db.collection('HMI').where({
          name: that.data.userInfo.nickName,
          win: 1
        }).get({
          success: res => {
            wintemp = res.data.length
          },
          fail: console.error
        })
        console.log('win:' + wintemp)
        //总局数
        db.collection('HMI').where({
          name: that.data.userInfo.nickName
        }).get({
          success: res => {
            timestemp = res.data.length
          },
          fail: console.error
        })
        console.log('times:' + timestemp)
        //平局
        db.collection('HMI').where({
          name: that.data.userInfo.nickName,
          win: 2
        }).get({
          success: res => {
            peacetemp = res.data.length
          },
          fail: console.error
        })
        console.log('peace:' + peacetemp)
        setTimeout(function() {
          db.collection('HMI_record').add({
            data: {
              _id: that.data.user_id,
              name: that.data.userInfo.nickName,
              img: that.data.userInfo.avatarUrl,
              times: timestemp,
              win: wintemp,
              peace: peacetemp
            },
            success: console.log,
            fail: console.error
          })
        }, 500)
      }
    }, 500)
  },

  reject: function() {
    wx.showModal({
      title: '暂停开放',
      content: '数据库访问已达上限，今日内停止开放',
      showCancel: false,
      confirmText: '确定'
    })
  },

  HMI: function() {
    wx.redirectTo({
      url: '../TicTacToeGame2/TicTacToeGame2?name=' + this.data.userInfo.nickName + '&img=' + this.data.userInfo.avatarUrl + '&id=' + this.data.user_id,
    })
  }
})