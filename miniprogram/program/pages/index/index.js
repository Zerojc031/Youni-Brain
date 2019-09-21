//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    like: 0
  },
  //事件处理函数
  onLoad: function() {

    if (!app.globalData.openid) {
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          console.log('[云函数] [login] user openid: ', res.result.openid)
          app.globalData.openid = res.result.openid
        },
        fail: err => {
          console.error('[云函数] [login] 调用失败', err)
        }
      })
    }

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
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },

  getUserInfo: function(e) {
    console.log(e)
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      })
    } else {
      wx.showToast({
        title: '您未授权用户信息',
        icon: 'none',
        duration: 2000,
      })
    }
  },
  toPrimeNum: function() {
    wx.navigateTo({
      url: 'PrimeNum/PrimeNum',
    })
  },
  toTicTacToe: function() {
    wx.navigateTo({
      url: 'TicTacToeIndex/TicTacToeIndex',
    })
  },
  toJumpBall: function() {
    wx.navigateTo({
      url: 'JumpBallIndex/JumpBallIndex',
    })
  },
  like: function() {
    if (this.data.like != 1) this.setData({
      like: 1
    })
  },
  toDaily: function() {
    wx.navigateTo({
      url: '../daily/daily',
    })
  }
})