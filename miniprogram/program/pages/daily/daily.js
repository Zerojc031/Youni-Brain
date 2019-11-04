// program/pages/Daily/Daily.js

const app = getApp()
wx.cloud.init()
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: [
      'cloud://kungfuteapanda-j6pl1.6b75-kungfuteapanda-j6pl1/daily/image/1.jpg',
      'cloud://kungfuteapanda-j6pl1.6b75-kungfuteapanda-j6pl1/daily/image/1.jpg',
      'cloud://kungfuteapanda-j6pl1.6b75-kungfuteapanda-j6pl1/daily/image/1.jpg',
      'cloud://kungfuteapanda-j6pl1.6b75-kungfuteapanda-j6pl1/daily/image/1.jpg'
    ],
    nowUrl: 'cloud://kungfuteapanda-j6pl1.6b75-kungfuteapanda-j6pl1/daily/image/1.jpg',
    textStatus: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadText()
    // this.getPicture()
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  toIndex: function () {
    wx.navigateBack({
      delta: 1
    })
  },

  loadText: function () {
    var that = this
    var text, hourText, myDate = new Date()
    var date = myDate.getMonth() + 1 + '月' + myDate.getDate() + '日'
    var hour = myDate.getHours()
    // console.log('%'+myDate.getFullYear() +'^'+ myDate.getMonth() +'&'+ myDate.getDate()+'*'+myDate.getHours())

    if (hour >= 4 && hour <= 7) hourText = '早安'
    else if (hour >= 8 && hour <= 10) hourText = '早上好'
    else if (hour >= 11 && hour <= 13) hourText = '午安'
    else if (hour >= 14 && hour <= 18) hourText = '下午好'
    else if (hour >= 19 && hour <= 21) hourText = '晚上好'
    else if (hour >= 22 && hour <= 24 || hour >= 0 && hour <= 3) hourText = '晚安'

    db.collection('control').doc('daily').get({
      success: function (res) {
        console.log('success:', res)
        text = res.data.text[myDate.getDate()]
      },
      fail: function (res) { },
      complete: function (res) {
        if (!text) text = '如果栽了跟头就倒地不起，碰了钉子就逃之夭夭，立下再多志愿也只是白费时间。让努力成为习惯，把挫折看作鞭策。再硬着头皮闯一次，再咬紧牙关拼一回，不知不觉，你就会变得更加强大。'
        var dataText = text + hourText + '！'
        that.setData({
          textStatus: true,
          dailyText: dataText,
          dailyDate: date
        })
      }
    })
  },

  toUpload: function () {
    wx.navigateTo({
      url: 'upload/upload',
    })
    // var that = this
    // const ctx = wx.createCanvasContext('daily')
    // wx.chooseImage({
    //   count: 1,
    //   success: function(res) {
    //     console.log('chooseImage', res)
    //     ctx.drawImage(res.tempFilePaths[0], 0, 0, 500, 900, 0, 0, 250, 450)
    //     ctx.draw()
    //   },
    // })
  },

})