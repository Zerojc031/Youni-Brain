const app = getApp()
const db = wx.cloud.database(),
  egg = db.collection('control');
var nickName;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    check: 0,
    nickName,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true,
        nickName: app.globalData.userInfo.nickName,
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true,
          nickName: res.userInfo.nickName,
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
            nickName: res.userInfo.nickName,
          })
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    // var that = this;
    // egg.where({
    //   _id: 'jump_ball_rainbow',
    //   effect: true,
    //   specific: that.data.nickName,
    // }).get({
    //   success: function (res) {
    //     console.log(res);
    //     console.log(that.data.nickName);
    //     if(res.data.length>0)that.data.check = 1;
    //   }
    // })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  toJumpBall: function(e) {
    wx.navigateTo({
      url: "../JumpBall/JumpBall",
    })
  },
  toJumpBallRank: function() {
    wx.navigateTo({
      url: '../JumpBallRank/JumpBallRank',
    })
  },
  toIndex: function() {
    //先判断当前页面栈再返回首页
    const pages = getCurrentPages()
    if (pages.length === 2) {
      wx.navigateBack({
        fail: function() {
          wx.reLaunch({
            url: '../index',
          })
        }
      })
    } else {
      wx.reLaunch({
        url: '../index',
      })
    }
  },
  getUserInfo: function(e) {
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true,
        nickName: e.detail.userInfo.nickName,
      })
    } else {
      wx.showToast({
        title: '您未授权用户信息',
        icon: 'none',
        duration: 2000,
      })
    }
  },
})