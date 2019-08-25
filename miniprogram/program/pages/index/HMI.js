//记住，所有变量和函数加上this
//不能cout
//int改成var
export default class HMI {
  constructor() {
    var chess = [];
    for (var r = 0; r < 9; r++) {
      var row = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      chess.push(row);
    }
    this.chess = chess;
    this.state = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.score = [1, 2, 4, 16];
  }
  check(a, b, turn) {
    this.chess[a][b] = turn;
    if (this.chess[a][0] != 0) {
      if ((this.chess[a][0] == this.chess[a][1] && this.chess[a][0] == this.chess[a][2]) ||
        (this.chess[a][0] == this.chess[a][3] && this.chess[a][0] == this.chess[a][6]) ||
        (this.chess[a][0] == this.chess[a][4] && this.chess[a][0] == this.chess[a][8])) {
        this.state[a] = this.chess[a][0];
      }
    }
    if (this.chess[a][4] != 0) {
      if ((this.chess[a][4] == this.chess[a][1] && this.chess[a][4] == this.chess[a][7]) ||
        (this.chess[a][4] == this.chess[a][3] && this.chess[a][4] == this.chess[a][5]) ||
        (this.chess[a][4] == this.chess[a][2] && this.chess[a][4] == this.chess[a][6])) {
        this.state[a] = this.chess[a][4];
      }
    }
    if (this.chess[a][8] != 0) {
      if ((this.chess[a][8] == this.chess[a][2] && this.chess[a][8] == this.chess[a][5]) ||
        (this.chess[a][8] == this.chess[a][6] && this.chess[a][8] == this.chess[a][7])) {
        this.state[a] = this.chess[a][8];
      }
    }
  }
  putchess(a,b) {
    //console.log('putchess0');
    this.check(a, b, 1);
    var result=[];
    var highest = -10000;
    if (this.state[b] == 0) {
      for (var i = 0; i < 9; i++) {
        if (this.chess[b][i] == 0) {
          this.check(b, i, 2);
          if (this.if_gameover() == true) {
            return (b+1)*10+i+1;
          }
          var temp = this.min(i);
          if (temp >= highest) {
            highest = temp;
            result[0] = b;
            result[1] = i;
          }
          this.chess[b][i] = 0;
          this.state[b] = 0;
        }
      }
    }
    if (this.state[b] != 0) {
      for (var j = 0; j < 9; j++) {
        if (this.state[j] == 0) {
          for (var i = 0; i < 9; i++) {
            if (this.chess[j][i] == 0) {
              this.check(j, i, 2);
              if (this.if_gameover() == true) {
                return (j + 1) * 10 + i + 1;
              }
              var temp = this.min(i);
              if (temp >= highest) {
                highest = temp;
                result[0] = j;
                result[1] = i;
              }
              this.chess[j][i] = 0;
              this.state[j] = 0;
            }
          }
        }
      }
    }
    //console.log('putchess1');
    if (result[0]>=0) {
      this.check(result[0], result[1], 2);
      return (result[0] + 1) * 10 + result[1] + 1;
    }
    else{
      return 0;
    }
    //这里要return结果，暂时没想好
  }
  min(i) {
    //console.log('min0');
    var result=[];
    var lowest = 10000;
    if (this.state[i] == 0) {
      for (var m = 0; m < 9; m++) {
        if (this.chess[i][m] == 0) {
          this.check(i, m, 1);
          if (this.if_gameover() == true) {
            this.chess[i][m] = 0;
            this.state[i] = 0;
            return -10000;
          }
          var temp = this.estimate();
          if (temp < lowest) {
            lowest = temp;
            result[0] = i;
            result[1] = m;
          }
          this.chess[i][m] = 0;
          this.state[i] = 0;
        }
      }
    }
    else {
      for (var n = 0; n < 9; n++) {
        if (this.state[n] == 0) {
          for (var m = 0; m < 9; m++) {
            if (this.chess[n][m] == 0) {
              this.check(n, m, 1);
              if (this.if_gameover() == true) {
                this.chess[n][m] = 0;
                this.state[n] = 0;
                return -10000;
              }
              var temp = this.estimate();
              if (temp < lowest) {
                lowest = temp;
                result[0] = n;
                result[1] = m;
              }
              this.chess[n][m] = 0;
              this.state[n] = 0;
            }
          }
        }
      }
    }
    var temp;
    if (result[0]>=0) {
      this.check(result[0], result[1], 1);
      temp = this.max(result[1]);
      this.chess[result[0]][result[1]] = 0;
      this.state[result[0]] = 0;
    }else{
      temp=10000;
    }
    return temp;
    /*var that=this;
    setTimeout(function(){
      console.log(result);
      that.check(result[0], result[1], 1);
      temp = that.max(result[1]);
      that.chess[result[0]][result[1]] = 0;
      that.state[result[0]] = 0;
      console.log('min1');
      return temp;
    },50)*/
  }
  max(b) {
    //console.log('max0');
    var highest = -10000;
    if (this.state[b] == 0) {
      for (var i = 0; i < 9; i++) {
        if (this.chess[b][i] == 0) {
          this.check(b, i, 2);
          var temp = this.estimate();
          if (temp > highest) {
            highest = temp;
          }
          this.chess[b][i] = 0;
          this.state[b] = 0;
        }
      }
    }
    if (this.state[b] != 0) {
      for (var j = 0; j < 9; j++) {
        if (this.state[j] == 0) {
          for (var i = 0; i < 9; i++) {
            if (this.chess[j][i] == 0) {
              this.check(j, i, 2);
              var temp = this.estimate();
              if (temp > highest) {
                highest = temp;
              }
              this.chess[j][i] = 0;
              this.state[j] = 0;
            }
          }
        }
      }
    }
    //console.log('max1');
    return highest;
  }
  estimate() {
    //console.log('estimate0');
    var value1=[];
    var value0=[];
    for (var i = 0; i < 9; i++) {
      if (this.state[i] == 0) {
        this.turn1 = 0;
        this.turn2 = 0;//初始分数
        this.three(this.chess[i][0], this.chess[i][1], this.chess[i][2]);
        this.three(this.chess[i][0], this.chess[i][3], this.chess[i][6]);
        this.three(this.chess[i][0], this.chess[i][4], this.chess[i][8]);
        this.three(this.chess[i][4], this.chess[i][1], this.chess[i][7]);
        this.three(this.chess[i][4], this.chess[i][3], this.chess[i][5]);
        this.three(this.chess[i][4], this.chess[i][2], this.chess[i][6]);
        this.three(this.chess[i][8], this.chess[i][2], this.chess[i][5]);
        this.three(this.chess[i][8], this.chess[i][6], this.chess[i][7]);
        value1[i] = this.turn2;
        value0[i] = this.turn1;
      }
      else if (this.state[i] == 2) {
        value1[i] = 30;//待调整
        value0[i] = 0;
      }
      else {
        value0[i] = 30;//待调整
        value1[i] = 0;
      }
    }
    //console.log('estimate1');
    return (value1[0] * value1[1] * value1[2] +
      value1[0] * value1[3] * value1[6] +
      value1[0] * value1[4] * value1[8] +
      value1[4] * value1[1] * value1[7] +
      value1[4] * value1[3] * value1[5] +
      value1[4] * value1[2] * value1[6] +
      value1[8] * value1[2] * value1[5] +
      value1[8] * value1[6] * value1[7]) -
      (value0[0] * value0[1] * value0[2] +
        value0[0] * value0[3] * value0[6] +
        value0[0] * value0[4] * value0[8] +
        value0[4] * value0[1] * value0[7] +
        value0[4] * value0[3] * value0[5] +
        value0[4] * value0[2] * value0[6] +
        value0[8] * value0[2] * value0[5] +
        value0[8] * value0[6] * value0[7]);
  }
  three(a, b, c) {
    if (a + b + c == 0) {
      this.turn1 += this.score[0];
      this.turn2 += this.score[0];
    }
    if (a + b + c == 1) {
      this.turn1 += this.score[1];
    }
    if (a + b + c == 2) {
      if (a == 2 || b == 2 || c == 2) {
        this.turn2 += this.score[1];
      }
      else {
        this.turn1 += this.score[2];
      }
    }
    if (a + b + c == 4) {
      if (a != 1 && b != 1 && c != 1) {
        this.turn2 += this.score[2];
      }
    }
    if (a == b && a == c) {
      if (a == 1) {
        this.turn1 += this.score[3];
      }
      if (a == 2) {
        this.turn2 += this.score[3];
      }
    }
  }
  if_gameover(){
    if (this.state[0] != 0) {
      if ((this.state[0] == this.state[1] && this.state[0] == this.state[2]) ||
        (this.state[0] == this.state[3] && this.state[0] == this.state[6]) ||
        (this.state[0] == this.state[4] && this.state[0] == this.state[8])) {
        return true;
      }
    }
    if (this.state[4] != 0) {
      if ((this.state[4] == this.state[1] && this.state[4] == this.state[7]) ||
        (this.state[4] == this.state[3] && this.state[4] == this.state[5]) ||
        (this.state[4] == this.state[2] && this.state[4] == this.state[6])) {
        return true;
      }
    }
    if (this.state[8] != 0) {
      if ((this.state[8] == this.state[2] && this.state[8] == this.state[5]) ||
        (this.state[8] == this.state[6] && this.state[8] == this.state[7])) {
        return true;
      }
    }
    return false;
  }
}