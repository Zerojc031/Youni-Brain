const app = getApp()
var systemInfo = new Object(),
  circleCenter = new Object(),
  userInfo = new Object(),
  angle = new Array,
  allw = new Array,
  w = new Array,
  x = new Array,
  y = new Array,
  wc, r, ball_r, g, h, v1, v0, v, vc, fh, index, ball_num, t, score, bestScore, bool, bool2, id, openid, stamp, times, gameon;

wx.cloud.init()
const db = wx.cloud.database(), //引用数据库
  table = db.collection('jump_ball'), //引用集合(表)
  getOpenid = db.collection('temp_data'), //过渡集合，以获取openid
  _ = db.command; //查询指令

Page({
  /**
   * 页面的初始数据
   */
  data: {
    status: 1, //1已开始，2已结束
    systemInfo, //系统信息
    circleCenter, //轨道信息
    userInfo,
    r, //轨道半径
    ball_r: 3.85, //球的半径 
    wc: 32, //角速度系数
    ball_num: 6, //所有小球的数量
    allw: [3.6, 1.02, -1.9, 1.48, 1.65, -0.95],
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
    fh, //施力区域的高度，玄学，勿改
    index, //操作小球的编号
    w, //操作小球的角速度
    x,
    y, //小球坐标
    bool: 0, //分数记录数据库是否有集合，0无，1有
    id, //数据库集合记录id
    openid,
    stamp,
    bool2: 0, //temp_data数据库是否有集合，0无，1有
    times: 0, //玩的次数
    gameon: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success(res) {
              console.log(res);
              that.data.userInfo = res.userInfo;
            }
          })
        }
      }
    })
    // 获取_openid
    this.data.stamp = Date.parse(new Date()) / 1000; //获取当前时间戳（单位：秒）
    getOpenid.where({
      temp_data_key: 1,
    }).get({
      success: function(res) {
        //查得到记录就记录openid
        that.data.openid = res.data[0]._openid;
        console.log("获取openid：" + that.data.openid);
        that.data.bool2 = 1;
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var d = this.data,
      temp = 1;

    //角速度随机分配
    d.index = Math.floor(Math.random() * d.ball_num);
    d.w[d.index] = d.allw[0];
    for (var i = 0; i < d.ball_num; i++) {
      if (i != d.index) d.w[i] = d.allw[temp], temp++;
    }
    //获取设备像素比、屏幕宽高
    wx.getSystemInfo({
      success(res) {
        d.systemInfo.width = res.windowWidth;
        d.systemInfo.height = res.windowHeight;
        d.systemInfo.pixelRatio = res.pixelRatio; // 像素比
        d.fh = (res.windowHeight - res.windowWidth) * 1;
        d.ball_r = res.windowWidth / 375 * 3.5;
      },
    })
    this.draw()
    this.interval = setInterval(this.draw, 15)
  },

  draw: function() {
    /** 计时计分 */
    this.time();
    var d = this.data,
      ds = d.systemInfo,
      dc = d.circleCenter;
    d.r = ds.width / 4;
    dc.x = ds.width / 2;
    dc.y = ds.width / 2;
    var ctx = wx.createCanvasContext('canvas');
    /** 画圆形轨迹 */
    ctx.arc(dc.x, dc.y, d.r, 0, 2 * Math.PI)
    ctx.setFillStyle('black')
    ctx.setLineWidth(0.8)
    ctx.stroke()

    function ball(x, y, color, temp_h) {
      ctx.beginPath()
      // console.log('dc.x:%f,dc.y:%f,d.r:%f,h:%f,angle:%f', dc.x, dc.y, d.r, h, angle)
      ctx.arc(x, y, d.ball_r, 0, Math.PI * 2 - 0.000001)
      ctx.closePath()
      ctx.setFillStyle(color)
      ctx.setStrokeStyle(color)
      ctx.setLineWidth(1)
      ctx.fill()
      ctx.stroke()
      // console.log('执行画球')
    }

    function ballRainbow(x, y, temp_h) {
      /**
       *  红: #FF0000
          橙: #FF7D00
          黄: #FFFF00
          绿: #00FF00
          青: #00FFFF
          蓝: #0000FF
          紫: #FF00FF
       */
      // ball(x, y,'rgba(0, 162, 255,1)',temp_h);
      var delta_theta = d.t * Math.PI * 0.018;
      ctx.beginPath()
      ctx.arc(x, y, d.ball_r, Math.PI * 5 / 12 + delta_theta, Math.PI * 1 / 12 + delta_theta, false)
      ctx.moveTo(x + d.ball_r * Math.cos(Math.PI * 1 / 12 + delta_theta), y + d.ball_r * Math.sin(Math.PI * 1 / 12 + delta_theta))
      ctx.lineTo(x - d.ball_r * Math.cos(Math.PI * 5 / 12 + delta_theta), y - d.ball_r * Math.sin(Math.PI * 5 / 12 + delta_theta))
      ctx.arc(x, y, d.ball_r, Math.PI * 17 / 12 + delta_theta, Math.PI * 13 / 12 + delta_theta, false)
      ctx.moveTo(x + d.ball_r * Math.cos(Math.PI * 13 / 12 + delta_theta), y + d.ball_r * Math.sin(Math.PI * 13 / 12 + delta_theta))
      ctx.lineTo(x + d.ball_r * Math.cos(Math.PI * 5 / 12 + delta_theta), y + d.ball_r * Math.sin(Math.PI * 5 / 12 + delta_theta))
      ctx.closePath()
      ctx.setFillStyle('#7FFF00')
      ctx.setStrokeStyle('#7FFF00')
      ctx.setLineWidth(1)
      ctx.fill()
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(x, y, d.ball_r, Math.PI * 5 / 12 + delta_theta, Math.PI * 13 / 12 + delta_theta, )
      ctx.moveTo(x + d.ball_r * Math.cos(Math.PI * 13 / 12 + delta_theta), y + d.ball_r * Math.sin(Math.PI * 13 / 12 + delta_theta))
      ctx.lineTo(x + d.ball_r * Math.cos(Math.PI * 5 / 12 + delta_theta), y + d.ball_r * Math.sin(Math.PI * 5 / 12 + delta_theta))
      ctx.closePath()
      ctx.setFillStyle('#EE0000')
      ctx.setStrokeStyle('#EE0000')
      ctx.setLineWidth(1)
      ctx.fill()
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(x, y, d.ball_r, Math.PI * 17 / 12 + delta_theta, Math.PI * 25 / 12 + delta_theta)
      ctx.moveTo(x + d.ball_r * Math.cos(Math.PI * 25 / 12 + delta_theta), y + d.ball_r * Math.sin(Math.PI * 25 / 12 + delta_theta))
      ctx.lineTo(x - d.ball_r * Math.cos(Math.PI * 5 / 12 + delta_theta), y - d.ball_r * Math.sin(Math.PI * 5 / 12 + delta_theta))
      ctx.closePath()
      ctx.setFillStyle('#1E90FF')
      ctx.setStrokeStyle('#1E90FF')
      ctx.setLineWidth(1)
      ctx.fill()
      ctx.stroke()
    }

    /** 重力作用 */
    d.h += d.v;
    if (d.h < 0) {
      d.h = 0;
      d.v = 0;
    };
    if (d.h > 0) d.v -= d.g;
    /** 水平位移 */
    for (var i = 0; i < d.ball_num; i++) {
      d.angle[i] += d.w[i] * d.wc * 0.0001;
      // console.log('w:%f', d.w[i]);
      if (i == d.index) {
        d.x[i] = dc.x + (d.r + d.ball_r + d.h) * Math.cos(d.angle[i]);
        d.y[i] = dc.y + (d.r + d.ball_r + d.h) * Math.sin(d.angle[i]);
        ballRainbow(d.x[i], d.y[i], d.h);
      } else {
        ball(d.x[i], d.y[i], '#FF0000', 0);
        d.x[i] = dc.x + (d.r + d.ball_r) * Math.cos(d.angle[i]);
        d.y[i] = dc.y + (d.r + d.ball_r) * Math.sin(d.angle[i]);
      }
    }
    ctx.draw();

    if (this.data.bool == 0 && this.data.openid) {
      d.bool = -1;
      //最高分数据本地初始化
      var that = this;
      table.where({
        // key: _.eq(1)
        _openid: that.data.openid,
        key: 1
      }).get({
        success: function(res) {
          if (res.data[0].bestScore >= 0) {
            that.data.bestScore = res.data[0].bestScore;
            that.data.bool = 1;
            that.data.id = res.data[0]._id;
            if (res.data[0].times > 0) that.data.times = res.data[0].times, console.log("已经记录过次数了");
            else that.data.times = 1;
            console.log(that.data.openid)
            console.log(res)
            // console.log("查到了www")
          } else {
            that.data.bestScore = 0;
            that.data.bool = -1;
            that.data.times = 1;
            console.log("查不到www")
            //这个 else 不会执行，但为了保险
          }
          console.log("最高分数据本地初始化" + that.data[0].bestScore)
          console.log(res)
        },
        fail: function(res) {
          that.data.bestScore = 0;
          that.setData({
            bool: -1,
          })
          console.log("查不到www")
        }
      })
    }
    // 返回两小球距离
    function distance(a, b) {
      return Math.sqrt((d.x[a] - d.x[b]) * (d.x[a] - d.x[b]) + (d.y[a] - d.y[b]) * (d.y[a] - d.y[b]));
    }
    for (var i = 0; i < d.ball_num; i++) {
      if (i != d.index && distance(i, d.index) < 2 * d.ball_r) {
        // 发生碰撞
        d.status = 2;
        console.log("碰撞");
        break;
      }
    }
    if (d.status == 2) {
      //全部静止，停止渲染
      clearInterval(this.interval);
      //上传分数到云端
      if (d.userInfo) this.upLoad();
      //弹窗
      // this.setData({
      //   gameon:0,
      // })
      console.log("弹窗");
      if (d.score >= d.bestScore) d.bestScore = d.score;
      var temp_content = "得分：" + d.score + "🌈\n" + "最高记录：" + d.bestScore;
      wx.showModal({
        title: '游戏结束',
        content: temp_content,
        cancelText: '返回',
        confirmText: '重新开始',
        success(res) {
          if (res.confirm) {
            console.log("点击重新开始");
            wx.reLaunch({
              url: '/pages/index/JumpBallRainbow/JumpBallRainbow',
              success: function(res) {},
              fail: function(res) {},
              complete: function(res) {},
            })
          } else {
            wx.redirectTo({
              url: '../JumpBallIndex/JumpBallIndex',
            })
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
  upLoad: function() {
    var d = this.data,
      score = d.score,
      timestamp = Date.parse(new Date()) / 1000; //获取当前时间戳（单位：秒）
    if (d.score >= d.bestScore) d.bestScore = d.score;
    if (d.times < 0) d.times = 0;
    d.times++;
    console.log("upLoad_bool:" + d.bool);
    //数据库无集合则创建集合
    if (d.bool <= 0 && d.score >= d.bestScore) {
      console.log("创建集合");
      table.add({
        data: {
          nickName: d.userInfo.nickName,
          gender: d.userInfo.gender,
          city: d.userInfo.city,
          avatarUrl: d.userInfo.avatarUrl,
          bestScore: d.bestScore,
          time: timestamp,
          key: 1,
          times: 1,
        }
      })
    } else {
      table.doc(d.id).update({
        data: {
          bestScore: d.bestScore,
          avatarUrl: d.userInfo.avatarUrl,
          nickName: d.userInfo.nickName,
          time: timestamp,
          times: d.times,
        }
      })
    }
  },
  time: function() {
    var d = this.data;
    d.t++;
    var temp_score = Math.floor((d.t) / 100);
    this.setData({
      score: temp_score,
    })
    if (d.t == 3000 && d.t == 6000 && d.t == 9000) d.w[d.index] += 0.1;
  },
  tap: function(e) {
    console.log(e);
    var d = this.data;
    if (2 * d.h < d.ball_r && d.v <= 0) {
      this.setData({
        h: 0,
      })
      d.v = d.vc * d.v0 * e.detail.x / d.systemInfo.width + d.v1;
    }
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
    clearInterval(this.interval);
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
    var titletext, d = this.data;
    if (d.bestScore > 0) titletext = "我的最高得分是" + d.bestScore + "分，快来挑战我吧！";
    else titletext = "跳跳球真难玩，你能得几分呢？";
    return {
      title: titletext,
      path: '/pages/index/JumpBallIndex/JumpBallIndex',
    }
  },

  /** 
   * 开发过程中的临时函数
   */
  // prepare: function() {
  //   var d = this.data;
  //   wx.getSystemInfo({ //获取设备像素比、屏幕宽高
  //     success(res) {
  //       d.systemInfo.width = res.windowWidth;
  //       d.systemInfo.height = res.windowHeight;
  //       d.systemInfo.pixelRatio = res.pixelRatio;
  //       d.systemInfo.h = (res.windowHeight - res.windowWidth) * 1;
  //       console.log("设备像素比是%d", res.pixelRatio);
  //       console.log('screen width = %d, height = %d', res.windowWidth, res.windowHeight, d.systemInfo.h);
  //     },
  //   })
  // },
  // drawCircle: function() {
  //   var d = this.data,
  //     ds = d.systemInfo,
  //     dc = d.circleCenter;
  //   d.r = ds.width / 4, dc.x = ds.width / 2, dc.y = ds.width / 2
  //   d.context = wx.createCanvasContext('canvas');
  //   var context = d.context;
  //   context.arc(dc.x, dc.y, d.r, 0, 2 * Math.PI, true)
  //   context.setFillStyle('black')
  //   context.setLineWidth(0.8)
  //   context.stroke()
  //   context.draw();
  // },

  // drawball: function() {
  //   var d = this.data,
  //     ds = d.systemInfo,
  //     dc = d.circleCenter;
  //   var context = d.context

  //   function ball(angle, color, h) {
  //     // context.translate(dc.x, dc.y)
  //     console.log('dc.x:%f,dc.y:%f,d.r:%f,h:%f,angle:%f', dc.x, dc.y, d.r, h, angle)
  //     context.arc(dc.x + (d.r + h) * Math.cos(angle), dc.y + (d.r + h) * Math.sin(angle), 5, 0, Math.PI * 2)
  //     context.setFillStyle(color)
  //     context.setStrokeStyle(color)
  //     context.setLineWidth(2)
  //     context.fill()
  //     context.stroke()
  //     console.log('执行画球')
  //     context.draw()
  //     // context.translate(-dc.x, -dc.y)
  //   }
  //   for (var i = 0; i < 4; i++) {
  //     d.angle[i] += d.w[i];
  //     if (i == 0) ball(d.angle[i], '#1aad19', 0)
  //     else ball(d.angle[i], '#FF0000', 0);
  //   }
  // },
  // area: function() {
  //   var area = wx.createCanvasContext('force');
  // },

})