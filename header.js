
const color_table = {'Z': 'red',
'L': 'orange',
'O': 'yellow',
'S': 'lime',
'I': 'cyan',
'J': 'blue',
'T': 'magenta',
'G': 'silver',
'N': 'black',
}

//shape code:48~63
//0123
//4567
//89:;
//<=>?
const shape_table = {I : [
    [[-1, 0], [0, 0], [1, 0], [2, 0]] ,[[0, 1], [0, 0], [0, -1], [0, -2]] ,[[-1, -1], [0, -1], [1, -1], [2, -1]] ,[[1, 1], [1, 0], [1, -1], [1, -2]] ,],
    J : [
    [[-1, 1], [-1, 0], [0, 0], [1, 0]] ,[[0, 1], [0, 0], [-1, -1], [0, -1]] ,[[-1, 0], [0, 0], [1, 0], [1, -1]] ,[[0, 1], [1, 1], [0, 0], [0, -1]] ,],
    L : [
    [[1, 1], [-1, 0], [0, 0], [1, 0]] ,[[-1, 1], [0, 1], [0, 0], [0, -1]] ,[[-1, 0], [0, 0], [1, 0], [-1, -1]] ,[[0, 1], [0, 0], [0, -1], [1, -1]] ,],
    S : [
    [[0, 1], [1, 1], [-1, 0], [0, 0]] ,[[-1, 1], [-1, 0], [0, 0], [0, -1]] ,[[0, 0], [1, 0], [-1, -1], [0, -1]] ,[[0, 1], [0, 0], [1, 0], [1, -1]] ,],
    Z : [
    [[-1, 1], [0, 1], [0, 0], [1, 0]] ,[[0, 1], [-1, 0], [0, 0], [-1, -1]] ,[[-1, 0], [0, 0], [0, -1], [1, -1]] ,[[1, 1], [0, 0], [1, 0], [0, -1]] ,],
    O : [
    [[0, 1], [1, 1], [0, 0], [1, 0]] ,[[0, 1], [1, 1], [0, 0], [1, 0]] ,[[0, 1], [1, 1], [0, 0], [1, 0]] ,[[0, 1], [1, 1], [0, 0], [1, 0]] ,],
    T : [
    [[0, 1], [-1, 0], [0, 0], [1, 0]] ,[[0, 1], [-1, 0], [0, 0], [0, -1]] ,[[-1, 0], [0, 0], [1, 0], [0, -1]] ,[[0, 1], [0, 0], [1, 0], [0, -1]] ,],
    G : [[],[],[],[]]
}

const possible_x_table={
    'O': [[0,8],[0,8],[0,8],[0,8]],
    'I': [[1,7],[0,9],[1,7],[1,8]],
    'Z': [[1,8],[1,9],[1,8],[0,8]],
    'S': [[1,8],[1,9],[1,8],[0,8]],
    'T': [[1,8],[1,9],[1,8],[0,8]],
    'J': [[1,8],[1,9],[1,8],[0,8]],
    'L': [[1,8],[1,9],[1,8],[0,8]],
    }

const possible_piece_config_table = {'O': [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8], [1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8], [2, 0], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7], [2, 8], [3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7], [3, 8]],
 'I': [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8], [1, 9], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7], [3, 8]],
  'Z': [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8], [1, 9], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7], [2, 8], [3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7], [3, 8]],
   'S': [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8], [1, 9], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7], [2, 8], [3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7], [3, 8]],
    'T': [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8], [1, 9], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7], [2, 8], [3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7], [3, 8]],
     'J': [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8], [1, 9], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7], [2, 8], [3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7], [3, 8]],
      'L': [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8], [1, 9], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7], [2, 8], [3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7], [3, 8]]}

const jltsz_clockwise_kick_table = [[[-1,0], [-1,1], [0,-2], [-1,-2]], //0->R 01
                              [[-1,0], [-1,-1], [0,2], [-1,2]], //L->0 30
                              [[1,0], [1,1], [0,-2], [1,-2]], //A->L 23
                              [[1,0], [1,-1], [0,2], [1,2]], //R->A 12
                              ] 
const jltsz_anticlockwise_kick_table = [[[1,0], [1,1], [0,-2], [1,-2]], //0->L 03
                              [[-1,0], [-1,-1], [0,2], [-1,2]], //L->A 32
                              [[-1,0], [-1,1], [0,-2], [-1,-2]], //A->R 21
                              [[1,0], [1,-1], [0,2], [1,2]]] //R->0 10
const jltsz_180_kick_table = [[[0,1]],
                        [[-1,0]],
                        [[0,-1]],
                        [[1,0]],
                        ]
const i_clockwise_kick_table = [[[-2,0], [1,0], [-2,-1], [1,2]], //0->R 01
                          [[1,0], [-2,0], [1,-2], [-2,1]], //L->0 30
                          [[2,0], [-1,0], [2,1], [-1,-2]], //A->L 23
                          [[-1,0], [2,0], [-1,2], [2,-1]]] //R->A 12
const i_anticlockwise_kick_table = [[[-1,0], [2,0], [-1,2], [2,-1]], //0->L 03
                              [[-2,0], [1,0], [-2,-1], [1,2]], //L->A 32
                              [[1,0], [-2,0], [1,-2], [-2,1]], //A->R 21
                              [[2,0], [-1,0], [2,1], [-1,-2]]] //R->0 10

const tspin_test2_table = [[[-1,1], [1,1]],
                    [[-1,1], [-1, -1]],
                    [[-1,-1], [1, -1]],
                    [[1,1], [1, -1]]]

const tspin_test3_table = [[-1,-1], [-1, 1], [1,1], [1, -1]]

const reverse_hold7_table = [
[0, 1, 2, 3, 4, 5, 6],
[0, 1, 2, 3, 4, 6, 5],
[0, 1, 2, 3, 5, 4, 6],
[0, 1, 2, 3, 6, 4, 5],
[0, 1, 2, 4, 3, 5, 6],
[0, 1, 2, 4, 3, 6, 5],
[0, 1, 2, 5, 3, 4, 6],
[0, 1, 2, 6, 3, 4, 5],
[0, 1, 3, 2, 4, 5, 6],
[0, 1, 3, 2, 4, 6, 5],
[0, 1, 3, 2, 5, 4, 6],
[0, 1, 3, 2, 6, 4, 5],
[0, 1, 4, 2, 3, 5, 6],
[0, 1, 4, 2, 3, 6, 5],
[0, 1, 5, 2, 3, 4, 6],
[0, 1, 6, 2, 3, 4, 5],
[0, 2, 1, 3, 4, 5, 6],
[0, 2, 1, 3, 4, 6, 5],
[0, 2, 1, 3, 5, 4, 6],
[0, 2, 1, 3, 6, 4, 5],
[0, 2, 1, 4, 3, 5, 6],
[0, 2, 1, 4, 3, 6, 5],
[0, 2, 1, 5, 3, 4, 6],
[0, 2, 1, 6, 3, 4, 5],
[0, 3, 1, 2, 4, 5, 6],
[0, 3, 1, 2, 4, 6, 5],
[0, 3, 1, 2, 5, 4, 6],
[0, 3, 1, 2, 6, 4, 5],
[0, 4, 1, 2, 3, 5, 6],
[0, 4, 1, 2, 3, 6, 5],
[0, 5, 1, 2, 3, 4, 6],
[0, 6, 1, 2, 3, 4, 5],
[1, 0, 2, 3, 4, 5, 6],
[1, 0, 2, 3, 4, 6, 5],
[1, 0, 2, 3, 5, 4, 6],
[1, 0, 2, 3, 6, 4, 5],
[1, 0, 2, 4, 3, 5, 6],
[1, 0, 2, 4, 3, 6, 5],
[1, 0, 2, 5, 3, 4, 6],
[1, 0, 2, 6, 3, 4, 5],
[1, 0, 3, 2, 4, 5, 6],
[1, 0, 3, 2, 4, 6, 5],
[1, 0, 3, 2, 5, 4, 6],
[1, 0, 3, 2, 6, 4, 5],
[1, 0, 4, 2, 3, 5, 6],
[1, 0, 4, 2, 3, 6, 5],
[1, 0, 5, 2, 3, 4, 6],
[1, 0, 6, 2, 3, 4, 5],
[2, 0, 1, 3, 4, 5, 6],
[2, 0, 1, 3, 4, 6, 5],
[2, 0, 1, 3, 5, 4, 6],
[2, 0, 1, 3, 6, 4, 5],
[2, 0, 1, 4, 3, 5, 6],
[2, 0, 1, 4, 3, 6, 5],
[2, 0, 1, 5, 3, 4, 6],
[2, 0, 1, 6, 3, 4, 5],
[3, 0, 1, 2, 4, 5, 6],
[3, 0, 1, 2, 4, 6, 5],
[3, 0, 1, 2, 5, 4, 6],
[3, 0, 1, 2, 6, 4, 5],
[4, 0, 1, 2, 3, 5, 6],
[4, 0, 1, 2, 3, 6, 5],
[5, 0, 1, 2, 3, 4, 6],
[6, 0, 1, 2, 3, 4, 5],
]

const reverse_hold6_table=[
[0, 1, 2, 3, 4, 5],
[0, 1, 2, 3, 5, 4],
[0, 1, 2, 4, 3, 5],
[0, 1, 2, 5, 3, 4],
[0, 1, 3, 2, 4, 5],
[0, 1, 3, 2, 5, 4],
[0, 1, 4, 2, 3, 5],
[0, 1, 5, 2, 3, 4],
[0, 2, 1, 3, 4, 5],
[0, 2, 1, 3, 5, 4],
[0, 2, 1, 4, 3, 5],
[0, 2, 1, 5, 3, 4],
[0, 3, 1, 2, 4, 5],
[0, 3, 1, 2, 5, 4],
[0, 4, 1, 2, 3, 5],
[0, 5, 1, 2, 3, 4],
[1, 0, 2, 3, 4, 5],
[1, 0, 2, 3, 5, 4],
[1, 0, 2, 4, 3, 5],
[1, 0, 2, 5, 3, 4],
[1, 0, 3, 2, 4, 5],
[1, 0, 3, 2, 5, 4],
[1, 0, 4, 2, 3, 5],
[1, 0, 5, 2, 3, 4],
[2, 0, 1, 3, 4, 5],
[2, 0, 1, 3, 5, 4],
[2, 0, 1, 4, 3, 5],
[2, 0, 1, 5, 3, 4],
[3, 0, 1, 2, 4, 5],
[3, 0, 1, 2, 5, 4],
[4, 0, 1, 2, 3, 5],
[5, 0, 1, 2, 3, 4],]

const reverse_hold5_table = [
[0, 1, 2, 3, 4],
[0, 1, 2, 4, 3],
[0, 1, 3, 2, 4],
[0, 1, 4, 2, 3],
[0, 2, 1, 3, 4],
[0, 2, 1, 4, 3],
[0, 3, 1, 2, 4],
[0, 4, 1, 2, 3],
[1, 0, 2, 3, 4],
[1, 0, 2, 4, 3],
[1, 0, 3, 2, 4],
[1, 0, 4, 2, 3],
[2, 0, 1, 3, 4],
[2, 0, 1, 4, 3],
[3, 0, 1, 2, 4],
[4, 0, 1, 2, 3],]

const reverse_hold4_table = [
[0, 1, 2, 3],
[0, 1, 3, 2],
[0, 2, 1, 3],
[0, 3, 1, 2],
[1, 0, 2, 3],
[1, 0, 3, 2],
[2, 0, 1, 3],
[3, 0, 1, 2],]


const reverse_hold3_table = [
[0, 1, 2],
[0, 2, 1],
[1, 0, 2],
[2, 0, 1],]

const reverse_hold2_table = [
[0, 1],
[1, 0],]

const reverse_hold_table = {
2: reverse_hold2_table,
3: reverse_hold3_table,
4: reverse_hold4_table,
5: reverse_hold5_table,
6: reverse_hold6_table,
7: reverse_hold7_table,
}

function shuffle(arr){
    for (var i=arr.length-1; i>0; i--){
        var idx = Math.floor(Math.random()*(i+1));
        var temp = arr[idx];
        arr[idx] = arr[i];
        arr[i] = temp;
    }
    return arr
}

class Game{
    constructor(){
        this.previous_keys = []
        this.mode = 'play'


        this.holdmino = ''
        this.bag = shuffle([...'IJLSZOT'])
        this.frame_num = 0
        
        this.tetramino = this.bag[0]
        this.x = 4
        this.y = 18
        this.orientation = 0
        this.lastmove = ''
        this.board = [
            ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
            ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
            ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
            ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
            ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
            ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
            ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
            ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
            ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
            ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
            ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
            ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
            ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
            ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
            ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
            ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
            ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
            ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
            ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'],
            ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N']]


        this.total_piece = 0
        this.drawmode = false

        this.combo = -1
        this.b2b = -1
        this.pc = false
        this.line_clear = 0
        this.total_line_clear = 0

    }

    to_shape(tetramino = null){
        if (tetramino === null){
            var tetramino = this.tetramino
            var orientation = this.orientation}
        else{
            var orientation = 0
            return shape_table[tetramino][orientation]
        } 
        var shape_code = shape_table[tetramino][orientation]
        var res = []
        for (var [x, y] of shape_code){
            res.push([x+ this.x, y+ this.y])}
        return res
    }


    is_collide(){
        for (var [col, row] of this.to_shape()){
            
            if (this.drawmode){               
                if (col <0 || col >9 || row<0 || row>19 || this.board[row][col] == 'G'){
                    return true}
                }
            else if (col <0 || col >9 || row<0 || row>19 || this.board[row][col] != 'N'){
                return true}
                
            }

        return false
    }

    move_left(){
        
        var previous_x = this.x
        this.x -= 1
        if (! this.is_collide()){
            this.lastmove = 'LEFT'
            return true}
            
        this.x = previous_x
        return false
    }

    move_right(){
        
        var previous_x = this.x
        this.x += 1
        if (! this.is_collide()){
            this.lastmove = 'RIGHT'
            return true}
            
        this.x = previous_x
        return false
    }
    move_leftmost(){
        for (var i=0; i<10; i++){
            if (! this.move_left()){
                return
            }
        }
    }

    move_rightmost(){
        for (var i=0; i<10; i++){
            if (! this.move_right()){
                return
            }
        }
    }

    rotate_anticlockwise(){
        var previous_orientation = this.orientation
        var previous_x = this.x
        var previous_y = this.y
        this.orientation = (this.orientation+1)%4
        if (! this.is_collide()){
            this.lastmove = 'z'
            return true
        }
        var kick_table =  'JLTSZ'.includes(this.tetramino)? jltsz_anticlockwise_kick_table : i_anticlockwise_kick_table
        for (var idx=0; idx< kick_table[previous_orientation].length; idx++){
            var coor = kick_table[previous_orientation][idx]
            var x = coor[0]
            var y = coor[1]
            this.x += x
            this.y += y
            if (! this.is_collide()){
                this.lastmove = 'zkick' + (idx+1)
                return true
            }
            this.x = previous_x
            this.y = previous_y
        }
        this.orientation = previous_orientation

        return false
    }

    rotate_clockwise(){
        var previous_orientation = this.orientation
        var previous_x = this.x
        var previous_y = this.y
        this.orientation = (this.orientation+3)%4
        if (! this.is_collide()){
            this.lastmove = 'z'
            return true
        }
        var kick_table =  'JLTSZ'.includes(this.tetramino)? jltsz_anticlockwise_kick_table : i_anticlockwise_kick_table
        for (var idx=0; idx< kick_table[this.orientation].length; idx++){
            var coor = kick_table[this.orientation][idx]
            var x = coor[0]
            var y = coor[1]
            this.x -= x
            this.y -= y
            if (! this.is_collide()){
                this.lastmove = 'zkick' + (idx+1)
                return true
            }
            this.x = previous_x
            this.y = previous_y
        }
        this.orientation = previous_orientation

        return false
    }

    rotate_180(){
        var previous_orientation = this.orientation
        var previous_x = this.x
        var previous_y = this.y
        this.orientation = (this.orientation+2)%4
        
        if (! this.is_collide()){
            this.lastmove = 'a'
            return true
        }

        if ('JLTSZ'.includes(this.tetramino)){
            for (var idx=0; idx< jltsz_180_kick_table[this.orientation].length; idx++){
                var coor = jltsz_180_kick_table[this.orientation][idx]
                var x = coor[0]
                var y = coor[1]
                this.x -= x
                this.y -= y
                if (! this.is_collide()){
                    this.lastmove = 'zkick' + (idx+1)
                    return true
                }
                this.x = previous_x
                this.y = previous_y
            }
        
            this.orientation = previous_orientation
        }
        return false
    }

    drop(factor = 20){

        for (var i=0; i<factor; i++){
            
            var previous_y = this.y
            this.y -= 1
            if (this.is_collide()){
                
                this.y = previous_y

                return false
            }
            this.lastmove = 'drop'
        }
        return true
    }

    lock(){
        for (var [col, row] of this.to_shape()){
            this.board[row][col] = this.tetramino
        }
    }

    clear_line(){
        var lines = []
        for (var row=19; row>=0; row--){
            if (this.board[row].every(para => para!='N')){
                lines.push(row)
            }
        }

        for (var line of lines){
            this.board.splice(line, 1)
            this.board.push(['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N'])
        }
    return lines.length
    }

    hold(){
        var temp = this.holdmino
        this.holdmino = this.bag[0]
        this.bag[0] = temp
        if (temp == '') this.bag.splice(0,1)
        this.update()
    }
    push(){
        this.bag.shift()
        this.generate()
        this.update()
    }
    generate(){
        if (this.bag.length < 7){
            this.bag = this.bag.concat(shuffle([...'IJLSZOT']))
        }
    }

    update(){
        this.tetramino = this.bag[0]
        this.x = 4
        this.y = 18
        this.orientation = 0
        this.lastmove = ''
    }

    softdrop(){
        this.drop()
    }
    
    harddrop(){
        this.drop()
        var tspin_flag = this.is_tspin()
        
        this.lock()
        this.push()
        var line_clear = this.clear_line()
        this.line_clear = line_clear
        this.total_piece += 1
        if (line_clear > 0){
            if (line_clear == 4 || tspin_flag){
                this.b2b += 1
            }
            else{
                this.b2b = -1
            }
            this.combo += 1
            this.total_line_clear += line_clear
            if (this.is_pc()){
                this.pc = true
            }
        }  
        else{
            this.combo = -1
            this.pc = false
        }
        if (this.is_collide()){
            retry()
        }
    }

    is_tspin(){
        var test1 = this.tetramino == 'T'
        if (!test1) return false
        var test2 = 0
        var test3 = 0
        for (var [x, y] of tspin_test2_table[this.orientation]){
            var testx = this.x+x
            var testy = this.y+y
            if ([-1, 10].includes(testx) || [-1, 20].includes(testy) || this.board[testy][testx] != 'N')
                test2 += 1
        }
        for (var [x, y] of tspin_test3_table){
            var testx = this.x+x
            var testy = this.y+y
            if ([-1, 10].includes(testx) || [-1, 20].includes(testy) || this.board[testy][testx] != 'N')
                test3 += 1
        }
        if (test1 && test2 == 2 && test3 >= 3){
            return true
        }
        else if (test1 && test2 == 1 && test3 >= 3){
            if (this.lastmove.slice(1) == 'kick4' && [1,3].includes(this.orientation))
                return true
            else if ('axz'.includes(this.lastmove[0]))
                return 'tspinmini'}
        return false
    }
    

    is_pc(){
        for (var row=0; row<20; row++)
            for (var col=0; col<10; col++)
                if (this.board[row][col] != 'N')
                    return false
        return true
    }

    get_max_height(){
        var heights = []
        for (var col=0; col<10; col++){
            var height = -1
            for (var row=0; row<20; row++){
                if (this.board[row][col] != 'N')
                    var height = row
            }
            heights.push(height)
        }
        return Math.max(...heights)
    }
}

// export {color_table, shuffle, Game}
