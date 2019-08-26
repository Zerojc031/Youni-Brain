const app = getApp()

wx.cloud.init()
const db = wx.cloud.database(), //引用数据库
  table = db.collection('jump_ball'), //引用集合(表)
  _ = db.command; //查询指令

Page({
  /**
   * 页面的初始数据
   */
  data: {
    status: 1, //1已开始，2已结束
    systemInfo: {}, //系统信息
    circleCenter: {}, //轨道信息
    userInfo: {},
    r: null, //轨道半径
    ballR: 3.85, //球的半径 
    wc: 32, //角速度系数
    ballNum: 6, //所有小球的数量
    allW: [3.6, 1.02, -1.9, 1.48, 1.65, -0.95],
    angle: [0, 1.0508, 5.2013, 3.14159, 2.0907, 4.2008],
    g: 0.045,
    v1: 1.05, //基础初速度
    v0: 3.8, //最大爆发速度
    vc: 0.38, //垂直速度系数
    v: 0, //垂直速度
    h: 0,
    t: 0, //计时
    score: 0, //分数
    bestScore: 0,
    fh: null, //施力区域的高度，玄学，勿改
    index: null, //操作小球的编号
    w: [], //操作小球的角速度
    x: [],
    y: [], //小球坐标
    bool: 0, //分数记录数据库是否有集合，0无，1有
    id: null, //数据库集合记录id
    openid: '',
    stamp: null,
    times: 0, //总次数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('传递参数', options)
    var that = this
    if (app.globalData.userInfo) this.data.userInfo = app.globalData.userInfo
    if (app.globalData.openid) {
      this.data.openid = app.globalData.openid
      if (this.data.bool == 0 && this.data.openid) {
        if (options.bestScore > 0) {
          this.data.bestScore = options.bestScore
          this.data.id = options.id
          this.data.times=options.times
          this.data.bool = 1
        } else {
          this.data.bool = -1;
          //最高分数据本地初始化
          table.where({
            _openid: that.data.openid,
            key: 1
          }).get({
            success: function (res) {
              if (res.data[0].bestScore >= 0) {
                that.data.bestScore = res.data[0].bestScore;
                that.data.bool = 1;
                that.data.id = res.data[0]._id;
                if (res.data[0].times > 0) that.data.times = res.data[0].times, console.log("已经记录过次数了", res.data[0].bestScore);
                else that.data.times = 1;
              } else {
                that.data.bestScore = 0;
                that.data.bool = -1;
                //这个 else 可能不会执行到
              }
            },
            fail: function (res) {
              that.data.bestScore = 0
              bool = -1
            }
          })
        }
      }
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //获取当前时间戳（单位：秒）
    this.data.stamp = Date.parse(new Date()) / 1000;
    //角速度随机分配
    var temp = 1;
    this.data.index = Math.floor(Math.random() * this.data.ballNum);
    this.data.w[this.data.index] = this.data.allW[0];
    for (var i = 0; i < this.data.ballNum; i++) {
      if (i != this.data.index) {
        this.data.w[i] = this.data.allW[temp];
        temp++;
      }
    }
    //获取设备像素比、屏幕宽高
    var that = this
    wx.getSystemInfo({
      success(res) {
        that.data.systemInfo.width = res.windowWidth;
        that.data.systemInfo.height = res.windowHeight;
        that.data.systemInfo.pixelRatio = res.pixelRatio; // 像素比
        that.data.fh = (res.windowHeight - res.windowWidth) * 1;
        that.data.ballR = res.windowWidth / 375 * 3.5;
      },
    })
    this.draw()
    this.interval = setInterval(this.draw, 15)
  },

  draw: function () {
    var that = this;

    // 返回两小球距离
    function distance(a, b) {
      return Math.sqrt((that.data.x[a] - that.data.x[b]) * (that.data.x[a] - that.data.x[b]) + (that.data.y[a] - that.data.y[b]) * (that.data.y[a] - that.data.y[b]));
    }

    function ball(x, y, color, temp_h) {
      ctx.beginPath()
      // console.log('this.data.circleCenter.x:%f,this.data.circleCenter.y:%f,this.data.r:%f,h:%f,angle:%f', this.data.circleCenter.x, this.data.circleCenter.y, this.data.r, h, angle)
      ctx.arc(x, y, that.data.ballR, 0, Math.PI * 2 - 0.000001)
      ctx.closePath()
      ctx.setFillStyle(color)
      ctx.setStrokeStyle(color)
      ctx.setLineWidth(2)
      ctx.fill()
      ctx.stroke()
      // console.log('执行画球')
    }
    /** 计时计分 */
    this.time();

    this.data.r = this.data.systemInfo.width / 4;
    this.data.circleCenter.x = this.data.systemInfo.width / 2;
    this.data.circleCenter.y = this.data.systemInfo.width / 2;
    var ctx = wx.createCanvasContext('canvas');

    /** 画圆形轨迹 */
    ctx.arc(this.data.circleCenter.x, this.data.circleCenter.y, this.data.r, 0, 2 * Math.PI)
    ctx.setFillStyle('black')
    ctx.setLineWidth(0.8)
    ctx.stroke()

    /** 重力作用 */
    this.data.h += this.data.v;
    if (this.data.h < 0) {
      this.data.h = 0;
      this.data.v = 0;
    };
    if (this.data.h > 0) this.data.v -= this.data.g;
    /** 水平位移 */
    for (var i = 0; i < this.data.ballNum; i++) {
      this.data.angle[i] += this.data.w[i] * this.data.wc * 0.0001;
      // console.log('w:%f', this.data.w[i]);
      if (i == this.data.index) {
        this.data.x[i] = this.data.circleCenter.x + (this.data.r + this.data.ballR + this.data.h) * Math.cos(this.data.angle[i]);
        this.data.y[i] = this.data.circleCenter.y + (this.data.r + this.data.ballR + this.data.h) * Math.sin(this.data.angle[i]);
        ball(that.data.x[i], that.data.y[i], 'rgba(0, 162, 255,1)', this.data.h);
      } else {
        ball(that.data.x[i], that.data.y[i], '#FF0000', 0);
        this.data.x[i] = this.data.circleCenter.x + (this.data.r + this.data.ballR) * Math.cos(this.data.angle[i]);
        this.data.y[i] = this.data.circleCenter.y + (this.data.r + this.data.ballR) * Math.sin(this.data.angle[i]);
      }
    }
    ctx.draw();

    for (var i = 0; i < this.data.ballNum; i++) {
      if (i != this.data.index && distance(i, that.data.index) < 2 * this.data.ballR) {
        // 发生碰撞
        this.data.status = 2;
        console.log("碰撞");
        break;
      }
    }
    if (this.data.status == 2) {
      //全部静止，停止渲染
      clearInterval(this.interval);
      //上传分数到云端
      if (this.data.userInfo) this.upLoad();
      //弹窗
      console.log("弹窗");
      if (this.data.openid && this.data.score >= this.data.bestScore) this.data.bestScore = this.data.score;
      if (this.data.openid) {
        var tempContent = "得分：" + this.data.score + "\n" + "最高记录：" + this.data.bestScore;
      } else {
        var tempContent = "得分：" + this.data.score + "\n"
      }
      wx.showModal({
        title: '游戏结束',
        content: tempContent,
        cancelText: '返回',
        confirmText: '重新开始',
        success(res) {
          if (res.confirm) {
            console.log("点击重新开始");
            wx.redirectTo({
              url: '../JumpBall/JumpBall?bestScore=' + that.data.bestScore + '&id=' + that.data.id+'&times='+that.data.times,
              success: function (res) { },
              fail: function (res) { },
              complete: function (res) { },
            })
          } else {
            var page = getCurrentPages()
            if (page > 0) {
              wx.navigateBack({
                delta: 1
              })
            } else {
              wx.redirectTo({
                url: '../JumpBallIndex/JumpBallIndex',
              })
            }
          }
        },
        fail(res) {
          //返回首页
          wx.redirectTo({
            url: '../JumpBallIndex/JumpBallIndex',
          })
        }
      })
    }
  },
  upLoad: function () {
    var score = this.data.score,
      timestamp = Date.parse(new Date()) / 1000; //获取当前时间戳（单位：秒）
    if (this.data.score >= this.data.bestScore) this.data.bestScore = this.data.score;
    if (this.data.times < 0) this.data.times = 0;
    this.data.times++;
    console.log("upLoad_bool:" + this.data.bool);
    //数据库无集合则创建集合
    if (this.data.bool <= 0 && this.data.score >= this.data.bestScore && this.data.openid) {
      console.log("创建集合");
      table.add({
        data: {
          nickName: this.data.userInfo.nickName,
          gender: this.data.userInfo.gender,
          city: this.data.userInfo.city,
          avatarUrl: this.data.userInfo.avatarUrl,
          bestScore: this.data.bestScore,
          time: timestamp,
          key: 1,
          times: 1,
        }
      })
    } else if (this.data.bool > 0 && this.data.openid) {
      table.doc(this.data.id).update({
        data: {
          bestScore: this.data.bestScore,
          avatarUrl: this.data.userInfo.avatarUrl,
          nickName: this.data.userInfo.nickName,
          time: timestamp,
          times: this.data.times,
        }
      })
    }
  },
  time: function () {
    this.data.t++;
    var tempScore = Math.floor((this.data.t) / 100);
    this.setData({
      score: tempScore,
    })
    if (this.data.t == 3000 && this.data.t == 6000 && this.data.t == 9000) this.data.w[this.data.index] += 0.1;
  },
  tap: function (e) {
    console.log(e);
    if (2 * this.data.h < this.data.ballR && this.data.v <= 0) {
      this.data.h = 0;
      this.data.v = this.data.vc * this.data.v0 * e.detail.x / this.data.systemInfo.width + this.data.v1;
    }
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
    wx.navigateBack({
      delta: 1,
      fail: function () {
        wx.reLaunch({
          url: '../index',
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.interval);
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
    var titletext, d = this.data;
    if (this.data.bestScore > 0) titletext = "我的最高得分是" + this.data.bestScore + "分，快来挑战我吧！";
    else titletext = "跳跳球真难玩，你能得几分呢？";
    return {
      title: titletext,
      path: '../JumpBallIndex/JumpBallIndex',
    }
  },
})