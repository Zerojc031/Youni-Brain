// pages/page1/page1.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rank: [],
    page: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 创建一个变量来保存页面page示例中的this, 方便后续使用
    var _this = this;
    wx.cloud.init()
    const db = wx.cloud.database()
    db.collection('record').orderBy('bestscore', 'desc')
      .skip(this.data.page * 20 - 20)
      .limit(20)
      .get({
        success: res => {
          this.setData({
            rank: res.data
          })
        }
      })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var _this = this;
    wx.cloud.init()
    const db = wx.cloud.database()
    db.collection('record').orderBy('bestscore', 'desc')
      .skip(this.data.page * 20 - 20)
      .limit(20)
      .get({
        success: res => {
          this.setData({
            rank: res.data
          })
        }
      })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  previous: function () {
    if (this.data.page > 1) {
      this.setData({
        page: this.data.page - 1
      })
    }
    var that = this
    that.onLoad()
  },

  next: function () {
    if (this.data.page < 3) {
      this.setData({
        page: this.data.page + 1
      })
    }
    var that = this
    that.onLoad()
  }
})