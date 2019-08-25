const app = getApp()
//计时器
function countdown(that) {
  var second = that.data.second
  if (second == 0) {
    // console.log("Time Out...");
    that.goback()
    return;
  }
  var gameon = that.data.gameon
  if (gameon == 0) {
    return;
  }
  var time = setTimeout(function() {
    that.setData({
      second: second - 1
    });
    countdown(that);
  }, 1000)
}

//云储存
wx.cloud.init()
const db = wx.cloud.database()

Page({
  data: {
    gameon: 0,
    firsttime: 1,
    second: 60,
    react: '',
    score: 0,
    index: 0,
    list_num: [23, 29, 31, 37, 41, 43, 47, 49, 53, 59, 61, 67, 71, 73, 77, 79, 83, 89, 91, 97, 101, 103, 107, 109, 113, 119, 121, 127, 131, 133, 137, 139, 143, 149, 151, 157, 161, 163, 167, 169, 173, 179, 181, 187, 191, 193, 197, 199, 203, 209, 211, 217, 221, 223, 227, 229, 233, 239, 241, 247, 251, 253, 257, 259, 263, 269, 271, 277, 281, 283, 287, 289, 293, 299, 301, 307, 311, 313, 317, 319, 323, 329, 331, 337, 341, 343, 347, 349, 353, 359, 361, 367, 371, 373, 377, 379, 383, 389, 391, 397, 401, 403, 407, 409, 413, 419, 421, 427, 431, 433, 437, 439, 443, 449, 451, 457, 461, 463, 467, 469, 473, 479, 481, 487, 491, 493, 497, 499, 503, 509, 511, 517, 521, 523, 527, 529, 533, 539, 541, 547, 551, 553, 557, 559, 561, 563, 567, 569, 571, 573, 577, 579, 581, 583, 587, 589, 591, 593, 597, 599, 601, 603, 607, 609, 611, 613, 617, 619, 621, 623, 627, 629, 631, 633, 637, 639, 641, 643, 647, 649, 651, 653, 657, 659, 661, 663, 667, 669, 671, 673, 677, 679, 681, 683, 687, 689, 691, 693, 697, 699, 701, 703, 707, 709, 711, 713, 717, 719, 721, 723, 727, 729, 731, 733, 737, 739, 741, 743, 747, 749, 751, 753, 757, 759, 761, 763, 767, 769, 771, 773, 777, 779, 781, 783, 787, 789, 791, 793, 797, 799, 801, 803, 807, 809, 811, 813, 817, 819, 821, 823, 827, 829, 831, 833, 837, 839, 841, 843, 847, 849, 851, 853, 857, 859, 861, 863, 867, 869, 871, 873, 877, 879, 881, 883, 887, 889, 891, 893, 897, 899, 901, 903, 907, 909, 911, 913, 917, 919, 921, 923, 927, 929, 931, 933, 937, 939, 941, 943, 947, 949, 951, 953, 957, 959, 961, 963, 967, 969, 971, 973, 977, 979, 981, 983, 987, 989, 991, 993, 997, 999],
    list_ans: [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0]
  },
  yes: function() {
    this.setData({
      index: Math.floor(Math.random() * 319),
      score: this.data.score + 3,
      react: 'correct!🙂👍',
      firsttime: 0
    })
  },
  no: function() {
    this.setData({
      index: Math.floor(Math.random() * 319),
      score: this.data.score - 3,
      react: 'wrong!😜⛽',
      firsttime: 0
    })
  },
  set_ran: function() {
    this.setData({
      index: Math.floor(Math.random() * 319),
      score: this.data.score - 2
    })
  },
  gameon: function() {
    this.setData({
      gameon: 1,
      second: 60,
      score: 0
    });
    countdown(this);
    setTimeout(this.onShow, 500)
  },
  goback: function() {
    this.setData({
      gameon: 0,
      react: ''
    })
    if (this.data.score > this.data.bestscore&&app.globalData.userInfo) {
      db.collection('record').doc(this.data.id).update({
        data: {
          bestscore: this.data.score
        },
        success: function(res) {
          console.log(res.data)
        }
      })
    }
  },
  onLoad: function() {
    try {
      var value_id = wx.getStorageSync('id')
      if (value_id) {
        this.setData({
          id: value_id
        })
      } else {
        this.setData({
          id: (Math.random() * 10000000).toString(16).substr(0, 4) + '-' + (new Date()).getTime() + '-' + Math.random().toString().substr(2, 5)
        })
        wx.setStorage({
          key: 'id',
          data: this.data.id,
        })
        if (app.globalData.userInfo) {
          db.collection('record').add({
            data: {
              bestscore: new Number(0),
              _id: this.data.id,
              username: this.data.userInfo.nickName,
              userimg: this.data.userInfo.avatarUrl,
              gender: this.data.userInfo.gender
            },
            success: function(res) {
              console.log(res)
            }
          })
        }
      }
    } catch (e) {}
  },
  toRank: function() {
    wx.navigateTo({
      url: '../PrimeNumRank/PrimeNumRank',
    })
  },
  onShow: function() {
    if (this.data.id) {
      db.collection('record').doc(this.data.id).get({
        success: res => {
          this.setData({
            bestscore: res.data.bestscore
          })
        }
      })
    }
  }
})