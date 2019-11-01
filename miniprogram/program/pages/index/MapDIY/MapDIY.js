// program/pages/index/MapDIY/MapDIY.js

const app = getApp();
var angle = [1, 0],
  center = 180, //圆心横纵坐标
  unitR = 45, //单位半径
  mathPi = Math.PI;
var ctx = wx.createCanvasContext('map');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    index: 5,
    array: [{
        id: 1,
        value: 30,
        color: '#00BFFF'
      },
      {
        id: 2,
        value: 30,
        color: '#00FA9A'
      },
      {
        id: 3,
        value: 30,
        color: '#FF7256'
      },
      {
        id: 4,
        value: 30,
        color: '#FFF68F'
      },
      {
        id: 5,
        value: 30,
        color: '#EE82EE'
      },
    ],
    range: 50,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.draw()
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

  draw: function() {
    let count = 0,
      thisAngle = 0;
    ctx.rect(0, 0, 360, 360)
    ctx.setLineWidth(0)
    ctx.setFillStyle('white')
    ctx.setStrokeStyle('white')
    ctx.fill()
    ctx.stroke()
    for (let i = 0; i < this.data.index; i++) count += this.data.array[i].value;
    for (let i = 0; i < this.data.index; i++) {
      if (this.data.array[i].value == 0) continue;
      angle[i] = 2 * mathPi * this.data.array[i].value / count;
      this.paint(this.data.array[i].value, thisAngle, thisAngle + angle[i], this.data.array[i].color);
      thisAngle += angle[i];
      // console.log(thisAngle + angle[i] + this.data.array[i].color)
    }
    ctx.draw();
  },

  paint: function(value, beginAngle, endAngle, color) {
    ctx.beginPath()
    ctx.arc(center, center, 2 * unitR, beginAngle, endAngle)
    ctx.lineTo(center + unitR * Math.cos(endAngle), center + unitR * Math.sin(endAngle))
    ctx.arc(center, center, unitR, endAngle, beginAngle, true)
    // ctx.moveTo(center + unitR * Math.cos(beginAngle), center + unitR * Math.sin(beginAngle))
    ctx.lineTo(center + 2 * unitR * Math.cos(beginAngle), center + 2 * unitR * Math.sin(beginAngle))
    ctx.closePath()
    ctx.setFillStyle(color)
    ctx.setStrokeStyle(color)
    ctx.setLineWidth(0)
    ctx.fill()
    ctx.setFontSize(20)
    ctx.setFillStyle('#5C5C5C')
    let middleAngle = (endAngle + beginAngle) / 2,
      k = middleAngle * 2 / Math.PI
    // ctx.fillText(value, center + 2 * (unitR + 7) * Math.cos(middleAngle), center + 2 * (unitR + 15) * Math.sin(middleAngle))
    if (k <= 1) ctx.fillText(value, center + 2 * (unitR + 8) * Math.cos(middleAngle) - 10, center + 2 * (unitR + 8) * Math.sin(middleAngle))
    else if (k < 2) ctx.fillText(value, center + 2 * (unitR + 8) * Math.cos(middleAngle) - 10, center + 2 * (unitR + 8) * Math.sin(middleAngle))
    else if (k < 3) ctx.fillText(value, center + 2 * (unitR + 7) * Math.cos(middleAngle) - 10, center + 2 * (unitR + 8) * Math.sin(middleAngle) + 10)
    else ctx.fillText(value, center + 2 * (unitR + 8) * Math.cos(middleAngle) - 10, center + 2 * (unitR + 8) * Math.sin(middleAngle) + 10)
    ctx.stroke()
  },

  changeRange: function(res) {
    console.log('input失去聚焦' + res);
    if (res.detail.value) {
      this.setData({
        range: res.detail.value
      })
    }
  },

  bindDataChange: function(res) {
    console.log('数据改变', res)
    let i = Number(res.target.id),
      value = Number(res.detail.value)
    this.data.array[i].value = value;
    this.draw()
  },

  toImage: function() {
    wx.canvasToTempFilePath({
      canvasId: 'map',
      success(res) {
        console.log('success', res.tempFilePath)
        wx.previewImage({
          urls: [res.tempFilePath],
          success(res) {
            wx.showToast({
              title: '长按保存',
              duration: 600
            })
            console.log('显示成功', res)
          },
          complete(res) {
            console.log('显示完成', res)
          }
        })
      },
      fail(res) {
        console.log('fail', res)
      },
      complete(res) {
        console.log('complete', res)
      }
    }, this)
  }
})