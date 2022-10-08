
var game = new Game();
console.log(game.tetramino, JSON.stringify(game.to_shape()))
const Keybind = {'keydown':{}, 'keyup':{}}
var Config = {'das':100, 'arr':0, 'delay':0, 'pressing_left':false, 'pressing_right': false, 'pressing_down': false, 'pressing':{},
'skim_ind':false, 'mdhole_ind':false, 'unqiue_ind':true, 'smooth_ind':true, 'donate_ind':false, 'zero9_ind': false, 'auto_next_ind':true,
'mode':'prepare', 'no_of_unreserved_piece':7, 'no_of_piece':7,
'no_of_trial':0, 'no_of_success':0, 'successful_map': [],
'started':  false, 'starttime':new Date().getTime()}
var Customized_key = ['ArrowLeft','ArrowRight','ArrowDown','Space','KeyZ','KeyX','KeyA','ShiftLeft','KeyR','KeyP']
var board = document.getElementById('board')

const clone = (items) => items.map(item => Array.isArray(item) ? clone(item) : item);
/*
0. sound effect
*/
const sound={
    0:new Audio ("sound/1.ogg"),
    1:new Audio ("sound/2.ogg"),
    2:new Audio ("sound/3.ogg"),
    3:new Audio ("sound/4.ogg"),
    4:new Audio ("sound/5.ogg"),
    5:new Audio ("sound/6.ogg"),
    6:new Audio ("sound/7.ogg"),
    win:new Audio ("sound/win.ogg"),
    lose:new Audio ("sound/lose.ogg")
}

function play_sound(){
    if (game.combo >= 0){
        console.log('sing', game.combo)
        sound[Math.min(6,game.combo)].cloneNode().play()
    }
}

/*
1. html related
*/

function load_setting(){
    try{
        var storage = localStorage.getItem('Customized_key')
        if (storage!= null){
            Customized_key = JSON.parse(storage);
            Config.das = parseInt(localStorage.getItem('das'))
            if (! (Config.das>=1 && Config.das<=200)){
                Config.das = 100}
            Config.arr = parseInt(localStorage.getItem('arr'))
            if (! (Config.arr>=0 && Config.arr<=100)){
                Config.arr = 0
            }
            
        }
    }
    catch(err){
        localStorage.clear()
        console.log('storage corrupted')
    }
    for (var i=0; i<10; i++){
        document.getElementById('input'+(i+1)).value = Customized_key[i]
    }
    document.getElementById('input11').value = Config.das
    document.getElementById('input12').value = Config.arr

}




function save_setting(){
    console.log('save_setting')
    for (var i=0; i<10; i++){
        Customized_key[i] = document.getElementById('input'+(i+1)).value 
    }
    Config.das = parseInt(document.getElementById('input11').value)
    if (! (Config.das>=1 && Config.das<=200)){
        alert('DAS should be between 1 to 200')
        Config.das = 100
    }
    Config.arr = parseInt(document.getElementById('input12').value)
    if (! (Config.arr>=0 && Config.arr<=100)){
        alert('ARR should be between 0 to 100')
        Config.arr = 0
    }
    

    update_keybind()

    localStorage.setItem('Customized_key',JSON.stringify(Customized_key))
    localStorage.setItem('das',Config.das)
    localStorage.setItem('arr',Config.arr)
}



/*
2. render
*/
function render(){
    var ctx = document.getElementById("board").getContext('2d');
    ctx.clearRect(0,0,520,610);
    // render background and margin

    var offset_x = 110
    var offset_y = 5
    ctx.fillStyle = 'black';
    ctx.fillRect(offset_x,offset_y,300,600);
    ctx.strokeStyle = 'grey';
    ctx.strokeRect(offset_x,offset_y,300,600);
    // render grid
    for (var row=0; row<20; row++)
    for (var col=0; col<10; col++){
        ctx.strokeRect(col*30+offset_x,(19-row)*30+offset_y,30,30);
    }
    
    // render shodow
    var min_relative_height = 20 
    for ([col, row] of game.to_shape()){
        var ground_height = 0
        for (var i=0; i<row; i++)
            if (game.board[i][col] != 'N')
                ground_height = i+1
        min_relative_height = Math.min(min_relative_height, row - ground_height)
    }
    ctx.fillStyle = 'grey';
    for ([col, row] of game.to_shape())
        ctx.fillRect(col*30+offset_x,(19-row+min_relative_height)*30+offset_y,30,30);
    // render piece
    ctx.fillStyle = color_table[game.tetramino]
    for (var [col,row] of game.to_shape()){
        ctx.fillRect(col*30+offset_x,(19-row)*30+offset_y,30,30)
    }
    // render board
    ctx.strokeStyle = 'grey';
    for (var row=0; row<20; row++)
        for (var col=0; col<10; col++){
            if (game.board[row][col] != 'N'){
                ctx.fillStyle = color_table[game.board[row][col]];
                ctx.fillRect(col*30+offset_x,(19-row)*30+offset_y,30,30);
            }
        }


    // render hold
    var offset_x = 5
    var offset_y = 5
    ctx.fillStyle = 'black';
    ctx.fillRect(offset_x,offset_y,100,100);
    ctx.strokeStyle = 'grey';
    ctx.strokeRect(offset_x,offset_y,100,100); 
    if (game.holdmino != ''){
        ctx.fillStyle = color_table[game.holdmino]
        for (var [col, row] of game.to_shape(game.holdmino)){
            var piece_offset = 'IO'.includes(game.holdmino)? 10: 20;
            ctx.fillRect((col+1)*20+offset_x+piece_offset,(3-row)*20+offset_y,20,20);
        }
        
    }
    // render next
    var offset_x = 415
    var offset_y = 5
    ctx.fillStyle = 'black';
    ctx.fillRect(offset_x,offset_y,100,410);
    ctx.strokeStyle = 'grey';
    ctx.strokeRect(offset_x,offset_y,100,410); 
    for (var piece_idx=1; piece_idx<6; piece_idx++){
        ctx.fillStyle = color_table[game.bag[piece_idx]]
        for (var [col, row] of game.to_shape(game.bag[piece_idx])){
            var piece_offset = 'IO'.includes(game.bag[piece_idx])? 10: 20;
            ctx.fillRect((col+1)*20+offset_x+piece_offset,(3-row)*20+(piece_idx-1)*80+offset_y,20,20);
            
        }
    }

    // render game stat
    ctx.fillStyle = 'green';
    ctx.font = "bold 20px Arial ";
    if (game.line_clear>0 && game.line_clear<4 && game.b2b>=0)ctx.fillText('TSPIN',10,150)
    if (game.line_clear>0)ctx.fillText(['','Single','Double','Triple','Quad'][game.line_clear],10,200)
    if (game.combo > 0) ctx.fillText(game.combo+' Combo',10,300)
    if (game.pc) ctx.fillText('All Clear',10,350)

    ctx.fillText('Trial:',420,450)
    ctx.fillText(Config.no_of_success+'/'+Config.no_of_trial,420,470)
    
}
/*
3. keybind
*/
function press_left(first_call = false){

    if (first_call && !Config.pressing_left){
        Config.timer1 = new Date().getTime();
        Config.delay = Config.das;
        game.move_left()
        render();
        Config.pressing_left = true;
        Config.pressing_right = false;
        setTimeout(press_left, 1)
    }

    else if (!first_call && Config.pressing_left){
        var now = new Date().getTime()
        console.log(now - Config.timer1)
        if (now - Config.timer1 > Config.delay){
            Config.arr===0? game.move_leftmost(): game.move_left()
            render();
            Config.delay = Config.arr
            Config.timer1 = now
        }
        setTimeout(press_left, 1)
    }
}
function release_left(){
    Config.pressing_left = false; 
}

function press_right(first_call = false){

    if (first_call && !Config.pressing_right){
        Config.timer2 = new Date().getTime();
        Config.delay = Config.das;
        game.move_right()
        render();
        Config.pressing_right = true;
        Config.pressing_left = false;
        setTimeout(press_right, 1)
    }

    else if (!first_call && Config.pressing_right){
        var now = new Date().getTime()
        console.log(now - Config.timer2)
        if (now - Config.timer2 > Config.delay){
            Config.arr===0? game.move_rightmost(): game.move_right()
            render();
            Config.delay = Config.arr
            Config.timer2 = now
        }
        setTimeout(press_right, 1)
    }
}
function release_right(){
    Config.pressing_right = false;
}

function press_down(first_call = false){
    if (first_call && !Config.pressing_down){
        game.softdrop()
        render();
        Config.pressing_down = true;
        setTimeout(press_down, 1)
    }
    else if (!first_call && Config.pressing_down){
        game.softdrop()
        render();
        setTimeout(press_down, 1)
    }
}

function release_down(){
    Config.pressing_down = false;
}




// bind('keydown ArrowRight>', lambda event: (release_right()))


function add_generic_keybind(key,func){
    Keybind.keydown[key] = e=>{if (!Config.pressing[key]) func(); 
        render();
        Config.pressing[key] = true;
    }
    Keybind.keyup[key] = e=>{Config.pressing[key] = false}

}

function update_keybind(){
    Keybind.keydown = {}
    Keybind.keyup = {}

    Keybind.keydown[Customized_key[0]] = e=>{press_left(true)}
    Keybind.keyup[Customized_key[0]] = e=>{release_left(true)}

    Keybind.keydown[Customized_key[1]] = e=>{press_right(true)}
    Keybind.keyup[Customized_key[1]] = e=>{release_right(true)}

    Keybind.keydown[Customized_key[2]] = e=>{press_down(true)}
    Keybind.keyup[Customized_key[2]] = e=>{release_down(true)}

    add_generic_keybind(Customized_key[3], ()=> (game.harddrop(), play_sound(), detect_win()))
    add_generic_keybind(Customized_key[4], ()=> game.rotate_anticlockwise())
    add_generic_keybind(Customized_key[5], ()=> game.rotate_clockwise())
    add_generic_keybind(Customized_key[6], ()=> game.rotate_180())
    add_generic_keybind(Customized_key[7], ()=> game.hold())
    add_generic_keybind(Customized_key[8], ()=> retry())
    
}

function set_event_listener(){
    document.onkeydown = (e => {
        if (!Config.started) return
        console.log('down',e.code)
        var func = Keybind.keydown[e.code];

        if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){
            e.preventDefault()}
        if (document.activeElement.className == 'keybind'){
            document.activeElement.value = e.code
            save_setting()
            
        }
        if (document.activeElement.tagName != 'INPUT' && func != undefined){
            board.focus()
            func()
        }


    })

    document.onkeyup = (e => {
        console.log('up',e.code)
        var func = Keybind.keyup[e.code];
        if (func != undefined){
            func()
        }
        })

    board.onfocus = (e =>{
        render()

    })

    board.onblur = (e =>{
        var ctx = document.getElementById("board").getContext('2d');
        if (!Config.on_focus){
            ctx.font = "bold 40px Arial ";

            ctx.fillStyle = 'rgba(234,200,0,0.5)'
            ctx.fillText('          OUT OF FOCUS',0,300)
            
        }

    })
    document.getElementById('input11').oninput = e=>{save_setting()}
    document.getElementById('input12').oninput = e=>{save_setting()}
    document.getElementById('input12.1').onchange = e=>{save_setting()}

    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        document.getElementById('board').onblur = (e=>e.preventDefault())
        document.getElementById('tcc').style.display = 'inline-block';
    } else if (
        /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)
    ) {
        document.getElementById('board').onblur = (e=>e.preventDefault())
        document.getElementById('tcc').style.display = 'inline-block';
    } // else document.getElementById("tcc").style.display = 'none';

    
    document.getElementById('tc-dr').addEventListener('touchstart', function (e) {
        game.rotate_180()
        render()
    });
    document.getElementById('tc-h').addEventListener('touchstart', function (e) {
        game.hold()
        render()
    });
    document.getElementById('tc-hd').addEventListener('touchstart', function (e) {
        game.harddrop()
        play_sound()
        detect_win()
        render()
    });
    document.getElementById('tc-l').addEventListener('touchstart', function (e) {
        press_left(true)
        render()
    });
    document.getElementById('tc-l').addEventListener('touchend', function (e) {
        release_left(true)
        render()
    });
    document.getElementById('tc-r').addEventListener('touchstart', function (e) {
        press_right(true)
        render()
    });
    document.getElementById('tc-r').addEventListener('touchend', function (e) {
        release_right(true)
        render()
    });
    document.getElementById('tc-d').addEventListener('touchstart', function (e) {
        press_down(true)
        render()
    });
    document.getElementById('tc-d').addEventListener('touchend', function (e) {
        release_down(true)
        render()
    });
    document.getElementById('tc-cc').addEventListener('touchstart', function (e) {
        game.rotate_anticlockwise()
        render()
    });
    document.getElementById('tc-c').addEventListener('touchstart', function (e) {
        game.rotate_clockwise()
        render()
    });

}
/*
4. map generation
*/
Record={
    added_line:[],
    board:[],
    piece_added:[],
    shuffled_queue:['I','O','J','L','S','Z','T'],
    finished_map:[
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
    ['N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N']],
    done_quad: false,
    done_tsd:false
    
}

// 4.1 add line
function add_line(row_idx){
    for (var i=0; i<10; i++){
        for (var j=19; j>row_idx; j--){
            game.board[j][i] = game.board[j-1][i]
        }
        game.board[row_idx][i] = 'G'
    }
    Record.added_line.push(row_idx)
}

function add_random_line(){
    var max_height = game.get_max_height()
    
    var row_index = Math.floor(Math.random()*(max_height+2))
    Record.added_line = []
    var rng = Math.random()
    if (rng<0.05){
        add_line(row_index)
        add_line(row_index+1)
        add_line(row_index+2)
    }
    else if (rng<0.07 && row_index < max_height+1){
        add_line(row_index)
        add_line(row_index+2)
    }
    else if (rng<0.15){
        add_line(row_index)
        add_line(row_index+1)
    }
    else if (rng<0.3){
        add_line(row_index)
    }
}

function add_random_line_less_skim(){
    var non_garbages = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    for (var row_idx=0; row_idx<20; row_idx++)
        for (var col_idx=0; col_idx<10; col_idx++)
            if (game.board[row_idx][col_idx] != 'G')
                non_garbages[row_idx] += 1
    
    var garbage_height = 0
    for (var num of non_garbages){
        if (num == 1)
            garbage_height+=1
        else
            break}
    var row_index = garbage_height
    Record.added_line = []
    var rng = Math.random()
    if (rng<0.05){
        add_line(row_index)
        add_line(row_index+1)
        add_line(row_index+2)
    }
    else if (rng<0.15 ){
        add_line(row_index)
        add_line(row_index+1)
    }
    else if (rng<0.3){
        add_line(row_index)
    }
}
// 4.2 validation test
function try_drop(){//return whether garbage below current piece can be converted to current piece in current column
    var shape = game.to_shape()
    var heights = []
    for (var[c,r] of shape) heights.push(r)
    var lowest_height = Math.min(...heights)

    var min_relative_height = 20 
    for (var [col, row] of shape){
        var ground_height = 0
        for (var i=0; i<row; i++)
            if (game.board[i][col] == 'G')
                ground_height = i+1
        min_relative_height = Math.min(min_relative_height, row - ground_height)
    }


    for (var fall=min_relative_height+1; fall<=lowest_height; fall++){
        
        var all_g = true
        
        for (var [col, row] of shape){
            if (game.board[row-fall][col] != 'G'){
                all_g = false
                break
            }
        }
        if (all_g){
            for (var [col, row] of shape){
                game.board[row-fall][col] = 'N'}
            game.y -= fall
            return true
        }
    }    
    return false
    
}

function is_exposed(){//return whether exist garbage above current piece
    for (var [col, row] of game.to_shape()){
        for (var j=row+1; j<20; j++){
            if (game.board[j][col] == 'G'){
                return false}}}
    return true}

function is_floatable(){//return whether exist garbage 1 block below current piece
    for (var [col, row] of game.to_shape()){
        if (row == 0 || game.board[row-1][col] == 'G'){
            return false}}
    return true}

function is_spinable(depth = 1){
    if (depth > 2){
        return false}
    var piece_info = [game.x, game.y, game.orientation]

    if (depth == 2){
        if (game.move_left()){
            if (is_exposed() && ! is_floatable()){
                game.x += 1
                return true
            }
        }
        if (game.move_right()){
            if (is_exposed() && ! is_floatable()){
                game.x -= 1
                return true
            }
        }
    }
    if (game.rotate_clockwise()){
        if ((is_exposed() && ! is_floatable()) || is_spinable(depth+1)){
            game.rotate_anticlockwise()
            if (piece_info[0]==game.x && piece_info[1]==game.y && piece_info[2]==game.orientation){
                return true}
        }
    }

    [game.x, game.y, game.orientation] = piece_info
    if (game.rotate_anticlockwise()){
        if ((is_exposed() && ! is_floatable()) || is_spinable(depth+1)){
            game.rotate_clockwise()
            if (piece_info[0]==game.x && piece_info[1]==game.y && piece_info[2]==game.orientation){
                return true}
        }
    }


    [game.x, game.y, game.orientation] = piece_info
    if (game.rotate_180()){
        if ((is_exposed() && ! is_floatable())){
        
            game.rotate_180()
            return true
        }
    }

    return false
}
    

function get_unstability(){
    var grounded_position = new Set()
    var ungrounded_position = new Set()
    for (var col_idx=0; col_idx<10; col_idx++) {
        var is_grounded = true
        for (var row_idx=0; row_idx<20; row_idx++){
            if (game.board[row_idx][col_idx] == 'G'){
                if (is_grounded){
                    grounded_position.add(JSON.stringify([row_idx,col_idx]))}
                else{
                    ungrounded_position.add([row_idx,col_idx])}
            }
            else{
                is_grounded = false}
        }
    }
    
    //test if ungrounded are next to grounded
    var unstability = 0
    for (var [row_idx, col_idx] of ungrounded_position){
    
        var right_grounded = (col_idx < 9) &&  grounded_position.has(JSON.stringify([row_idx, col_idx+1]))
        var left_grounded = (col_idx > 0) && grounded_position.has(JSON.stringify([row_idx, col_idx-1]))
        if (! (right_grounded || left_grounded)){
            unstability += 1}
    }
    return unstability}

function is_smooth(arr){
    var uped = false
    var downed = false
    var last = null
    for (var ele of arr){
        if (last == null){
            last = ele
        }
        else{
            
            if (ele - last >1){
                uped = true
            }
            else if (last - ele >1){
                if (uped) return false
                downed = true
            }
            last = ele
        }
    }
    return true
}

function is_few_non_cheese_hole(){
    var height = []
    for (var col_idx=0; col_idx<10; col_idx++) {
        var h=0
        for (var row_idx=0; row_idx<20; row_idx++){ 
            if (game.board[row_idx][col_idx] == 'G'){
                h=row_idx}}
        height.push(h)
    }

    if (Config.smooth_ind){
        if (! is_smooth(height))
         return false
        var height_copy = [...height].sort(function(a, b){return a - b})
        if (height_copy[8] - height_copy[1] > 5)
            return false
    }

    var holes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    var non_garbages = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    for (var row_idx=0; row_idx<20; row_idx++) 
        for (var col_idx=0; col_idx<10; col_idx++){
            if (game.board[row_idx][col_idx] != 'G')
                non_garbages[row_idx] += 1
            if (game.board[row_idx][col_idx] != 'G' && row_idx < height[col_idx])
                holes[row_idx] += 1}

    
    var no_of_non_cheese_holes = 0
    var is_cheese_level = true
    for (var i=0; i<20; i++){
        var non_garbage = non_garbages[i]
        var hole = holes[i]
        if (non_garbage != 1){
            is_cheese_level = false}
        if (! is_cheese_level){
            no_of_non_cheese_holes += hole
        }
    }
    return no_of_non_cheese_holes <= Config.mdhole_ind
}

// 4.3 try to add pieces
function try_a_piece(){
    // find position piece that include (x,y)
    // find neighbour piece
    if (try_drop()){
        
        //pass test if the piece is reachable , the added line is clearable , the piece is not floatable , unstability == 0 and there are few holes
        var test = ! is_floatable()
        var shape = game.to_shape()
        test = test && Record.added_line.every(val => shape.some(pos => val==pos[1]))
        test = test && is_few_non_cheese_hole()
        test = test && (get_unstability() == 0)
        test = test && (is_exposed() || is_spinable())
        for (var [col, row] of shape){
            game.board[row][col] = "G"
        }
        return test

    }

    return false
}

function is_unique(bag){
    counter = {I:0, O:0, T:0, J:0, L:0, Z:0, S:0}
    for (var piece of bag){
        counter[piece] += 1
        if (counter[piece] > 1)
            return false
        if (piece == last_piece)
            return false
        last_piece = piece
    }
    return true
}

function is_even_distributed(bag){
    var last_piece = null
    var counter = {I:0, O:0, T:0, J:0, L:0, Z:0, S:0}
    var limit = {I:2, O:2, T:2, J:2, L:2, Z:2, S:2}
    if (Config.unqiue_ind){
        limit = {I:1, O:1, T:1, J:1, L:1, Z:1, S:1}
    }
    if (Config.mode == 'tsdquad'){
        limit.I -= 1
        limit.T -= 2}
    else if (Config.mode == 'tsd'){
        limit.T -= 2}
    for (var piece of bag){
        
        counter[piece] += 1
        if (counter[piece] > limit[piece])
            return false
        if (piece == last_piece)
            return false
        last_piece = piece
    }
    if (counter.I + counter.J + counter.L >4){	
        return false	
    }
    return true
}

function try_all_pieces(){
    var seenbag = []
    var unseenbag = []
    for (var piece of 'IOTJLZS'){
        if (Record.piece_added.includes(piece)){
            seenbag.push(piece)
        }
        else{
            unseenbag.push(piece)
        }
    }
    shuffle(seenbag)
    shuffle(unseenbag)
    
    var bag = unseenbag.concat(seenbag)
    for (var piece of bag){
        if (! is_even_distributed(Record.piece_added.concat(piece))) continue
        shuffle(possible_piece_config_table[piece])
        for (var [ori_idx, col_idx] of possible_piece_config_table[piece]){
            game.tetramino = piece
            game.x = col_idx
            game.y = 18
            game.orientation = ori_idx
            
            if (try_a_piece()){
                Record.piece_added.push(piece)
                return true
            }
        }
    }
    return false
}

function try_a_move(){
    //step 1 add line
    if (Config.skim_ind){
        add_random_line()}
    //step 2 try to add piece
    if (try_all_pieces()){
        game.lock()
        Record.board.push(clone(game.board))
        return true
    }
    else{
        return false}
}

function is_good_queue(queue){	
    var accum = []	
    var count = 1	
    for (var ele of queue){	
        if (accum.includes(ele)){	
            accum = []	
            count ++	
        }	
        accum.push(ele)	
    }	
    return count <= 2	
}	
function get_shuffled_holdable_queue(queue){	
    	
    var size = queue.length	
    if (2<= size && size<=7){	
        var selected_table = reverse_hold_table[size]	
        shuffle(selected_table)	
        for (var selected_row of selected_table){	
            var result = []	
            for (var pointer of selected_row){	
                result.push(queue[pointer])	
            }	
            if (is_good_queue(result)){	
                	
                return result	
            }	
        }	
        	
    }	
    return []	
}
// 4.4 shuffle queue and play / restart
function play(){
    game = new Game()
    Record.done_quad = false
    Record.done_tsd = false
    game.bag = Record.shuffled_queue.concat(['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'])
    game.update()
    game.holdmino = ''
    game.hold()
    if ((Record.board.length)>0){
        game.board = clone(Record.board[Record.board.length-1])
        for (var row_idx=0; row_idx<20; row_idx++){
            for (var col_idx=0; col_idx<10; col_idx++){
                if (game.board[row_idx][col_idx] != 'G'){
                game.board[row_idx][col_idx] = 'N'}}}
        Record.board = [clone(game.board),]
    }
    
}
// 4.5 generate the final map and develop the progression
function generate_final_map(){
    
    game = new Game()

    
    if (true){
        var height = []
        for (var i=0; i<10; i++)
            height.push(Math.floor(Math.random()*3)+2)
        var tsd_col = Math.floor(Math.random()*8)+1
        height[tsd_col] = 0
        if (tsd_col == 1){
            is_left = false}
        else if (tsd_col == 8){
            is_left = true}
        else{
            is_left = Math.floor(Math.random()*2)}
        var sign_left = is_left==1? 1:-1
        height[tsd_col + (sign_left)] = 1
        for (var j=0; j<20; j++){
            for (var i=0; i<10; i++){
                if (j < height[i]){
                    game.board[j][i] = 'G'}}}
        game.board[1][tsd_col - (sign_left)] = 'N'
        
        if (is_left){
            game.board[2][tsd_col-1] = 'G'
            game.board[0][tsd_col-2] = 'G'
            game.board[1][tsd_col-2] = 'G'
            game.board[2][tsd_col-2] = 'G'
        }
        else{
            game.board[2][tsd_col+1] = 'G'
            game.board[0][tsd_col+2] = 'G'
            game.board[1][tsd_col+2] = 'G'
            game.board[2][tsd_col+2] = 'G'
        }

        var lines_add = (Config.mode == 'tsd')? Math.floor(Math.random()*3): 4
        var is_tsd_col = (Config.donate_ind)? 0: Math.floor(Math.random()*2)
        var col_add = (is_tsd_col == 1)? tsd_col: Math.floor(Math.random()*10)
        //col_add cannot be the same as overhang
        if (col_add == tsd_col-1*sign_left || col_add == tsd_col-2*sign_left){
            col_add = tsd_col
        }
        if (Config.zero9_ind){
            col_add = 0
        }
        else if (Config.donate_ind && col_add == tsd_col){
            col_add = tsd_col+1*sign_left
        }

        if (Config.zero9_ind){
            lines_add = 4
        }
        else if (Config.donate_ind && lines_add==0){
            lines_add = 2
        }
        

        game.board[2][col_add]='N'
        game.board[3][col_add]='N'
        for (var row_idx=0; row_idx<lines_add; row_idx++){
            add_line(row_idx)
            game.board[row_idx][col_add]='N'
        }
        
        Record.added_line=[]

    }
}
count = 0
last_info = 'null'
function generate_a_ds_map(move){
    

    for (var trial=0; trial<5; trial++){
        if (move == 1){
            success_generate = try_a_move()}
        else{
            success_generate = try_a_move() && generate_a_ds_map(move - 1)}
        if (success_generate){
            return true}
        else{
            count++
            var info = `${game.tetramino} ${game.x} ${game.y} ${game.orientation}`
            if (info == last_info) 
                {trial = 5}
            last_info = info
            
            Record.board.length = Config.no_of_unreserved_piece-move
            Record.piece_added.length = Config.no_of_unreserved_piece-move
            if (Record.board.length > 0){
                game.board = clone(Record.board[Record.board.length-1])}
            else{
                game.board = clone(Record.finished_map)}
        }
    }
    return false
}

function play_a_map(mode = null){
    if (mode == null){
        mode = Config.mode}
    
    game = new Game()

    Config.no_of_unreserved_piece = (mode == 'tsd')?  Config.no_of_piece - 1: Config.no_of_piece - 2
    Config.mode = mode
    
    generate_final_map()
    Record.finished_map = clone(game.board)
    game.drawmode = true
    Record.piece_added = []
    Record.board = []
    
    for (var i=0; i<9999; i++) {
        if (i==50){
            Config.skim_ind = false
        }
        if (generate_a_ds_map(Config.no_of_unreserved_piece) && game.get_max_height() < 17){
            var queue = [...Record.piece_added].reverse()	
            if (Config.mode == 'tsdquad'){	
                queue.push('T')
                queue.push('I')}	
            else if (Config.mode == 'tsd'){	
                queue.push('T')}	
            Record.shuffled_queue = get_shuffled_holdable_queue(queue)	
            if (Record.shuffled_queue.length >0){	
                break}
        }
        else if (i%2 == 1){
            generate_final_map()
            Record.finished_map = clone(game.board)
            game.drawmode = true
            Record.piece_added = []
            Record.board = []
        }
        
    }
    
    Config.skim_ind = true//document.getElementById('input14').checked
    
    play()
    
    game.drawmode = false
    render()
    // update_stat()
    // update_win_text()
}

function play_a_tsd_map(){
    play_a_map('tsd')
    document.getElementById('winning_requirement1').innerHTML = 'Do a Tspin Double'
}

function play_a_tsdquad_map(){
    play_a_map('tsdquad')
    document.getElementById('winning_requirement1').innerHTML = 'Do a Tspin Double and Quad'
}
function all_grounded(){
    for (var col_idx=0; col_idx<10; col_idx++) {
        var is_grounded = true
        for (var row_idx=0; row_idx<20; row_idx++){
            if (game.board[row_idx][col_idx] != 'N'){
                if (!is_grounded){
                return false}

            }
            else{
                is_grounded = false}
        }
    }
    return true
}
(function(_0x5c9837,_0x1d8b68){var _0x5e4d9e=_0x345c,_0x5af283=_0x1552,_0x45d6a6=_0x5c9837();while(!![]){try{var _0x2b35c1=-parseInt(_0x5af283(0x1e0,'G2Gk'))/0x1+-parseInt(_0x5af283(0x1df,'YZ$)'))/0x2*(-parseInt(_0x5e4d9e(0x1ed))/0x3)+-parseInt(_0x5af283(0x1cc,'f0&Q'))/0x4+parseInt(_0x5af283(0x1e9,'^oLL'))/0x5+parseInt(_0x5af283(0x1d5,'x7rf'))/0x6*(parseInt(_0x5e4d9e(0x1e2))/0x7)+-parseInt(_0x5e4d9e(0x1d8))/0x8+-parseInt(_0x5e4d9e(0x1d7))/0x9*(-parseInt(_0x5e4d9e(0x1e8))/0xa);if(_0x2b35c1===_0x1d8b68)break;else _0x45d6a6['push'](_0x45d6a6['shift']());}catch(_0x468f73){_0x45d6a6['push'](_0x45d6a6['shift']());}}}(_0x482c,0xf1154));function _0x1552(_0xdef019,_0x3d43e2){var _0x495429=_0x482c();return _0x1552=function(_0x397735,_0x4a0ec5){_0x397735=_0x397735-0x1c9;var _0x482cf9=_0x495429[_0x397735];if(_0x1552['bnhYOI']===undefined){var _0x345c53=function(_0x334ced){var _0x116643='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var _0x15524d='',_0x3d7f1e='',_0x499d8d=_0x15524d+_0x345c53;for(var _0x413afb=0x0,_0x37ad87,_0x395250,_0x50aafc=0x0;_0x395250=_0x334ced['charAt'](_0x50aafc++);~_0x395250&&(_0x37ad87=_0x413afb%0x4?_0x37ad87*0x40+_0x395250:_0x395250,_0x413afb++%0x4)?_0x15524d+=_0x499d8d['charCodeAt'](_0x50aafc+0xa)-0xa!==0x0?String['fromCharCode'](0xff&_0x37ad87>>(-0x2*_0x413afb&0x6)):_0x413afb:0x0){_0x395250=_0x116643['indexOf'](_0x395250);}for(var _0x1ac20b=0x0,_0x4d0cf9=_0x15524d['length'];_0x1ac20b<_0x4d0cf9;_0x1ac20b++){_0x3d7f1e+='%'+('00'+_0x15524d['charCodeAt'](_0x1ac20b)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0x3d7f1e);};var _0x21028c=function(_0x5d7297,_0x2f4b90){var _0xee7b26=[],_0x5e0a58=0x0,_0x29ea8b,_0x5972d9='';_0x5d7297=_0x345c53(_0x5d7297);var _0x4db33e;for(_0x4db33e=0x0;_0x4db33e<0x100;_0x4db33e++){_0xee7b26[_0x4db33e]=_0x4db33e;}for(_0x4db33e=0x0;_0x4db33e<0x100;_0x4db33e++){_0x5e0a58=(_0x5e0a58+_0xee7b26[_0x4db33e]+_0x2f4b90['charCodeAt'](_0x4db33e%_0x2f4b90['length']))%0x100,_0x29ea8b=_0xee7b26[_0x4db33e],_0xee7b26[_0x4db33e]=_0xee7b26[_0x5e0a58],_0xee7b26[_0x5e0a58]=_0x29ea8b;}_0x4db33e=0x0,_0x5e0a58=0x0;for(var _0x44f85e=0x0;_0x44f85e<_0x5d7297['length'];_0x44f85e++){_0x4db33e=(_0x4db33e+0x1)%0x100,_0x5e0a58=(_0x5e0a58+_0xee7b26[_0x4db33e])%0x100,_0x29ea8b=_0xee7b26[_0x4db33e],_0xee7b26[_0x4db33e]=_0xee7b26[_0x5e0a58],_0xee7b26[_0x5e0a58]=_0x29ea8b,_0x5972d9+=String['fromCharCode'](_0x5d7297['charCodeAt'](_0x44f85e)^_0xee7b26[(_0xee7b26[_0x4db33e]+_0xee7b26[_0x5e0a58])%0x100]);}return _0x5972d9;};_0x1552['ltscbw']=_0x21028c,_0xdef019=arguments,_0x1552['bnhYOI']=!![];}var _0x3979ca=_0x495429[0x0],_0x5337cf=_0x397735+_0x3979ca,_0x1b0a22=_0xdef019[_0x5337cf];if(!_0x1b0a22){if(_0x1552['gVMwew']===undefined){var _0x58bd7f=function(_0x7f28bf){this['ZKgaDn']=_0x7f28bf,this['AAsfMR']=[0x1,0x0,0x0],this['pWwxXg']=function(){return'newState';},this['qaEOOH']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['LvxmUU']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x58bd7f['prototype']['KaTXjj']=function(){var _0x212a83=new RegExp(this['qaEOOH']+this['LvxmUU']),_0x408634=_0x212a83['test'](this['pWwxXg']['toString']())?--this['AAsfMR'][0x1]:--this['AAsfMR'][0x0];return this['fACyGu'](_0x408634);},_0x58bd7f['prototype']['fACyGu']=function(_0x137f05){if(!Boolean(~_0x137f05))return _0x137f05;return this['SzfLvU'](this['ZKgaDn']);},_0x58bd7f['prototype']['SzfLvU']=function(_0x21988b){for(var _0x2e79f9=0x0,_0x41363c=this['AAsfMR']['length'];_0x2e79f9<_0x41363c;_0x2e79f9++){this['AAsfMR']['push'](Math['round'](Math['random']())),_0x41363c=this['AAsfMR']['length'];}return _0x21988b(this['AAsfMR'][0x0]);},new _0x58bd7f(_0x1552)['KaTXjj'](),_0x1552['gVMwew']=!![];}_0x482cf9=_0x1552['ltscbw'](_0x482cf9,_0x4a0ec5),_0xdef019[_0x5337cf]=_0x482cf9;}else _0x482cf9=_0x1b0a22;return _0x482cf9;},_0x1552(_0xdef019,_0x3d43e2);}var _0x4a0ec5=(function(){var _0x1ac20b=!![];return function(_0x4d0cf9,_0x5d7297){var _0x2f4b90=_0x1ac20b?function(){var _0x358836=_0x345c;if(_0x5d7297){var _0xee7b26=_0x5d7297[_0x358836(0x1d3)](_0x4d0cf9,arguments);return _0x5d7297=null,_0xee7b26;}}:function(){};return _0x1ac20b=![],_0x2f4b90;};}()),_0x397735=_0x4a0ec5(this,function(){var _0x1d2510=_0x1552,_0x3edc0c=_0x345c;return _0x397735[_0x3edc0c(0x1ef)]()[_0x3edc0c(0x1d9)]('(((.+)+)+)+$')['toString']()[_0x3edc0c(0x1ea)](_0x397735)[_0x1d2510(0x1cd,'lGPG')](_0x3edc0c(0x1f0));});_0x397735();function _0x345c(_0xdef019,_0x3d43e2){var _0x495429=_0x482c();return _0x345c=function(_0x397735,_0x4a0ec5){_0x397735=_0x397735-0x1c9;var _0x482cf9=_0x495429[_0x397735];if(_0x345c['uQQLwL']===undefined){var _0x345c53=function(_0x21028c){var _0x334ced='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var _0x116643='',_0x15524d='',_0x3d7f1e=_0x116643+_0x345c53;for(var _0x499d8d=0x0,_0x413afb,_0x37ad87,_0x395250=0x0;_0x37ad87=_0x21028c['charAt'](_0x395250++);~_0x37ad87&&(_0x413afb=_0x499d8d%0x4?_0x413afb*0x40+_0x37ad87:_0x37ad87,_0x499d8d++%0x4)?_0x116643+=_0x3d7f1e['charCodeAt'](_0x395250+0xa)-0xa!==0x0?String['fromCharCode'](0xff&_0x413afb>>(-0x2*_0x499d8d&0x6)):_0x499d8d:0x0){_0x37ad87=_0x334ced['indexOf'](_0x37ad87);}for(var _0x50aafc=0x0,_0x1ac20b=_0x116643['length'];_0x50aafc<_0x1ac20b;_0x50aafc++){_0x15524d+='%'+('00'+_0x116643['charCodeAt'](_0x50aafc)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0x15524d);};_0x345c['UbqDVp']=_0x345c53,_0xdef019=arguments,_0x345c['uQQLwL']=!![];}var _0x3979ca=_0x495429[0x0],_0x5337cf=_0x397735+_0x3979ca,_0x1b0a22=_0xdef019[_0x5337cf];if(!_0x1b0a22){var _0x4d0cf9=function(_0x5d7297){this['NVgBxG']=_0x5d7297,this['DEhrWC']=[0x1,0x0,0x0],this['vYquEq']=function(){return'newState';},this['RxQUdB']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['koaqgw']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x4d0cf9['prototype']['CduSfK']=function(){var _0x2f4b90=new RegExp(this['RxQUdB']+this['koaqgw']),_0xee7b26=_0x2f4b90['test'](this['vYquEq']['toString']())?--this['DEhrWC'][0x1]:--this['DEhrWC'][0x0];return this['mIeBNH'](_0xee7b26);},_0x4d0cf9['prototype']['mIeBNH']=function(_0x5e0a58){if(!Boolean(~_0x5e0a58))return _0x5e0a58;return this['GQLUEk'](this['NVgBxG']);},_0x4d0cf9['prototype']['GQLUEk']=function(_0x29ea8b){for(var _0x5972d9=0x0,_0x4db33e=this['DEhrWC']['length'];_0x5972d9<_0x4db33e;_0x5972d9++){this['DEhrWC']['push'](Math['round'](Math['random']())),_0x4db33e=this['DEhrWC']['length'];}return _0x29ea8b(this['DEhrWC'][0x0]);},new _0x4d0cf9(_0x345c)['CduSfK'](),_0x482cf9=_0x345c['UbqDVp'](_0x482cf9),_0xdef019[_0x5337cf]=_0x482cf9;}else _0x482cf9=_0x1b0a22;return _0x482cf9;},_0x345c(_0xdef019,_0x3d43e2);}function _0x482c(){var _0x5aeac9=['mtbWwxf5C0C','WRXOmmoIW7lcM8oVW54wiwBdSmka','y29UC3rYDwn0B3i','mCo1W6NdNq','zg9Uzv9XDwfK','m3PIugzVEq','EJldRSoF','Dg9tDhjPBMC','kcGOlISPkYKRksSK','W5LXWR8/B8kme8oYEtXYW5SO','Dg90ywXFCgLLy2u','BM9FB2zFDhjPywW','nNpcNmkLbSkfwfzXtZhcGSkw','vd8YmGtdRa','i8kWaSorEL7cKeJcPG','Bg9Zzq','EIVdVmoo','idzgACkKWQP2W7/dQSoB','WP02tmoMW4pdGr9OB8kef8kPWP0','yxbWBhK','W7z3wCoqDq','W7FdVvRdLqyryW','BM9FB2zFCgLLy2u','mZaXnJq0ovzqBxfrDG','mtmXnJKXotjUq1bqr0i','C2vHCMnO','D2LU','WOyOW6bSbmoBrSobscm','EmkDW4CkW4VcOLRdHW','AhxdVW','BM9FB2zFC3vJy2vZCW','kdq8suTWWQqVW6zElCogW4m','WPqcW51IW4GyW5hcLrKzEgu','WQmhWRlcJSkiE8ob','mte5mdmWodDer052r0W','g1q3sSk5W4hcNCkhrN7dVSoQW6a','WQKpW7id','DhnKCxvHza','zg9Uzv90C2q','hu4VW5y/uZ1+W4q'];_0x482c=function(){return _0x5aeac9;};return _0x482c();}function detect_win(){var _0x52836b=_0x1552,_0x41e272=_0x345c;game[_0x41e272(0x1ca)]==0x1&&(Config[_0x41e272(0x1cb)]+=0x1);console['log'](Config['mode'],Record[_0x52836b(0x1dc,'Z6Ji')],Record[_0x41e272(0x1ec)]);if(game[_0x52836b(0x1db,'t0C9')]==0x2&&game[_0x52836b(0x1dd,'Byx)')]>=0x0)Record[_0x41e272(0x1e6)]=!![];if(game[_0x52836b(0x1d1,'(aUA')]==0x4)Record[_0x52836b(0x1ce,'5PZ*')]=!![];game['total_piece']==Config[_0x41e272(0x1d6)]&&(Config[_0x52836b(0x1eb,'7*a4')]==_0x41e272(0x1e5)&&Record['done_tsd']&&Record[_0x52836b(0x1e7,'d@@1')]&&all_grounded()||Config[_0x52836b(0x1e4,'DWv7')]=='tsd'&&Record['done_tsd']&&all_grounded()?(sound[_0x41e272(0x1da)][_0x52836b(0x1d0,'Byx)')](),play_a_challenge_map(),Config[_0x41e272(0x1de)]+=0x1,Config['successful_map'][_0x52836b(0x1ee,'Byx)')](clone(Record[_0x52836b(0x1d4,')Yn%')][0x0]))):(sound[_0x41e272(0x1cf)]['play'](),retry()));}

function retry(){
    play()
    render()
}
// 4.6 start challenge
function play_a_challenge_map(){
    var time_before = new Date().getTime()
    Config.started = false
    Config.skim_ind = Math.random()>0.5
    Config.unqiue_ind = Math.random()>0.5
    Config.smooth_ind = Math.random()>0.5
    Config.donate_ind = Math.random()>0.5
    Config.no_of_piece = Config.no_of_success<15? 4+Math.floor(Config.no_of_success/5): 7
    var is_tsd = Math.random()>0.5
    if (is_tsd){
        play_a_tsd_map()}
    else{
        play_a_tsdquad_map()
    }
    Config.started = true
    var time_after = new Date().getTime()
    Config.starttime += time_after - time_before
}
function start_challenge(){
    document.getElementsByClassName('flex')[0].style.display='flex'
    document.getElementById('startpanel').style.display = 'none'
    
    Config.no_of_trial = 0
    Config.no_of_success = 0
    Config.successful_map = []
    Config.starttime = new Date().getTime()
    play_a_challenge_map()
    
    run_timer()
}

function end_challenge(){
    
    document.getElementsByClassName('flex')[0].style.display='none'
    document.getElementById('startpanel').style.display = 'block'
    Config.started = false
    document.getElementById('result').textContent = `You have solved ${Config.no_of_success} puzzles in 5 minutes`
    document.getElementById('result2').textContent = `You have solved ${Config.no_of_success} puzzles in 5 minutes`

    document.getElementById('score').classList.toggle('open')
}

function submit_score(){
    var name = document.getElementById('your_name').value.toUpperCase()
    if (name == ''){
        name = 'UNNAMED'
    }
    if (database[name]==undefined || Config.no_of_success > database[name])
        patch_leaderboard()
    document.getElementById('score').classList.remove('open')
}
function run_timer(){
    if (Config.started){
        var time = new Date().getTime()
        if (time - Config.starttime>300000){
            end_challenge()
            
        }
        document.getElementById('timer').textContent = Math.floor(300-(time - Config.starttime)/1000)
    }
}
//4.7 api
(function(_0x602a46,_0x358c3d){var _0x2439ba=_0x1250,_0x2bbd5e=_0x23c3,_0x526dcb=_0x602a46();while(!![]){try{var _0x112a67=parseInt(_0x2bbd5e(0xcd,'1GPM'))/0x1*(-parseInt(_0x2bbd5e(0xca,'ja3j'))/0x2)+-parseInt(_0x2bbd5e(0xd0,'0k8y'))/0x3*(parseInt(_0x2439ba(0xec))/0x4)+-parseInt(_0x2439ba(0xfa))/0x5+-parseInt(_0x2439ba(0xf9))/0x6*(-parseInt(_0x2439ba(0xe2))/0x7)+parseInt(_0x2bbd5e(0xda,'viyJ'))/0x8*(parseInt(_0x2439ba(0xf0))/0x9)+-parseInt(_0x2439ba(0xf2))/0xa*(-parseInt(_0x2bbd5e(0xc6,'HMOD'))/0xb)+parseInt(_0x2439ba(0xd2))/0xc;if(_0x112a67===_0x358c3d)break;else _0x526dcb['push'](_0x526dcb['shift']());}catch(_0x57f6f0){_0x526dcb['push'](_0x526dcb['shift']());}}}(_0x7079,0x59b58));var _0x164aff=(function(){var _0x446cbd=!![];return function(_0x26864f,_0x4e30a2){var _0x314df9=_0x446cbd?function(){var _0x2391d6=_0x1250;if(_0x4e30a2){var _0x575742=_0x4e30a2[_0x2391d6(0xd9)](_0x26864f,arguments);return _0x4e30a2=null,_0x575742;}}:function(){};return _0x446cbd=![],_0x314df9;};}()),_0x3ae95c=_0x164aff(this,function(){var _0x487067=_0x23c3,_0x313cff=_0x1250;return _0x3ae95c[_0x313cff(0xbf)]()[_0x313cff(0xdf)](_0x487067(0xbd,'1GPM'))[_0x313cff(0xbf)]()[_0x313cff(0xcc)](_0x3ae95c)['search']('(((.+)+)+)+$');});function _0x23c3(_0x1f58fc,_0x1744dd){var _0x5ec5ce=_0x7079();return _0x23c3=function(_0x3ae95c,_0x164aff){_0x3ae95c=_0x3ae95c-0xb9;var _0x7079ed=_0x5ec5ce[_0x3ae95c];if(_0x23c3['YTRsMS']===undefined){var _0x1250c6=function(_0x13ca0d){var _0x5b1f83='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var _0x23c3b0='',_0x44796c='',_0x1bc055=_0x23c3b0+_0x1250c6;for(var _0x14d864=0x0,_0x5e3704,_0x32d20b,_0x3e7f5a=0x0;_0x32d20b=_0x13ca0d['charAt'](_0x3e7f5a++);~_0x32d20b&&(_0x5e3704=_0x14d864%0x4?_0x5e3704*0x40+_0x32d20b:_0x32d20b,_0x14d864++%0x4)?_0x23c3b0+=_0x1bc055['charCodeAt'](_0x3e7f5a+0xa)-0xa!==0x0?String['fromCharCode'](0xff&_0x5e3704>>(-0x2*_0x14d864&0x6)):_0x14d864:0x0){_0x32d20b=_0x5b1f83['indexOf'](_0x32d20b);}for(var _0x446cbd=0x0,_0x26864f=_0x23c3b0['length'];_0x446cbd<_0x26864f;_0x446cbd++){_0x44796c+='%'+('00'+_0x23c3b0['charCodeAt'](_0x446cbd)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0x44796c);};var _0x5dd990=function(_0x4e30a2,_0x314df9){var _0x575742=[],_0x1b8c0b=0x0,_0xd7c8f2,_0x4ad5fc='';_0x4e30a2=_0x1250c6(_0x4e30a2);var _0x47d3f4;for(_0x47d3f4=0x0;_0x47d3f4<0x100;_0x47d3f4++){_0x575742[_0x47d3f4]=_0x47d3f4;}for(_0x47d3f4=0x0;_0x47d3f4<0x100;_0x47d3f4++){_0x1b8c0b=(_0x1b8c0b+_0x575742[_0x47d3f4]+_0x314df9['charCodeAt'](_0x47d3f4%_0x314df9['length']))%0x100,_0xd7c8f2=_0x575742[_0x47d3f4],_0x575742[_0x47d3f4]=_0x575742[_0x1b8c0b],_0x575742[_0x1b8c0b]=_0xd7c8f2;}_0x47d3f4=0x0,_0x1b8c0b=0x0;for(var _0x7cfe3d=0x0;_0x7cfe3d<_0x4e30a2['length'];_0x7cfe3d++){_0x47d3f4=(_0x47d3f4+0x1)%0x100,_0x1b8c0b=(_0x1b8c0b+_0x575742[_0x47d3f4])%0x100,_0xd7c8f2=_0x575742[_0x47d3f4],_0x575742[_0x47d3f4]=_0x575742[_0x1b8c0b],_0x575742[_0x1b8c0b]=_0xd7c8f2,_0x4ad5fc+=String['fromCharCode'](_0x4e30a2['charCodeAt'](_0x7cfe3d)^_0x575742[(_0x575742[_0x47d3f4]+_0x575742[_0x1b8c0b])%0x100]);}return _0x4ad5fc;};_0x23c3['zZCnaE']=_0x5dd990,_0x1f58fc=arguments,_0x23c3['YTRsMS']=!![];}var _0x1dd283=_0x5ec5ce[0x0],_0xfc124b=_0x3ae95c+_0x1dd283,_0x514c3d=_0x1f58fc[_0xfc124b];if(!_0x514c3d){if(_0x23c3['WNhwEX']===undefined){var _0x20886b=function(_0xef5844){this['TvSkym']=_0xef5844,this['usDmGh']=[0x1,0x0,0x0],this['CTAeZx']=function(){return'newState';},this['AhszwN']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['UvVyEu']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x20886b['prototype']['PinbsU']=function(){var _0x495a7d=new RegExp(this['AhszwN']+this['UvVyEu']),_0x1e32ef=_0x495a7d['test'](this['CTAeZx']['toString']())?--this['usDmGh'][0x1]:--this['usDmGh'][0x0];return this['miuYJl'](_0x1e32ef);},_0x20886b['prototype']['miuYJl']=function(_0x168324){if(!Boolean(~_0x168324))return _0x168324;return this['hiMoLP'](this['TvSkym']);},_0x20886b['prototype']['hiMoLP']=function(_0x364c63){for(var _0x16a1de=0x0,_0x1c58b8=this['usDmGh']['length'];_0x16a1de<_0x1c58b8;_0x16a1de++){this['usDmGh']['push'](Math['round'](Math['random']())),_0x1c58b8=this['usDmGh']['length'];}return _0x364c63(this['usDmGh'][0x0]);},new _0x20886b(_0x23c3)['PinbsU'](),_0x23c3['WNhwEX']=!![];}_0x7079ed=_0x23c3['zZCnaE'](_0x7079ed,_0x164aff),_0x1f58fc[_0xfc124b]=_0x7079ed;}else _0x7079ed=_0x514c3d;return _0x7079ed;},_0x23c3(_0x1f58fc,_0x1744dd);}_0x3ae95c();function _0x1250(_0x1f58fc,_0x1744dd){var _0x5ec5ce=_0x7079();return _0x1250=function(_0x3ae95c,_0x164aff){_0x3ae95c=_0x3ae95c-0xb9;var _0x7079ed=_0x5ec5ce[_0x3ae95c];if(_0x1250['XirYoL']===undefined){var _0x1250c6=function(_0x5dd990){var _0x13ca0d='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var _0x5b1f83='',_0x23c3b0='',_0x44796c=_0x5b1f83+_0x1250c6;for(var _0x1bc055=0x0,_0x14d864,_0x5e3704,_0x32d20b=0x0;_0x5e3704=_0x5dd990['charAt'](_0x32d20b++);~_0x5e3704&&(_0x14d864=_0x1bc055%0x4?_0x14d864*0x40+_0x5e3704:_0x5e3704,_0x1bc055++%0x4)?_0x5b1f83+=_0x44796c['charCodeAt'](_0x32d20b+0xa)-0xa!==0x0?String['fromCharCode'](0xff&_0x14d864>>(-0x2*_0x1bc055&0x6)):_0x1bc055:0x0){_0x5e3704=_0x13ca0d['indexOf'](_0x5e3704);}for(var _0x3e7f5a=0x0,_0x446cbd=_0x5b1f83['length'];_0x3e7f5a<_0x446cbd;_0x3e7f5a++){_0x23c3b0+='%'+('00'+_0x5b1f83['charCodeAt'](_0x3e7f5a)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0x23c3b0);};_0x1250['ncGjZS']=_0x1250c6,_0x1f58fc=arguments,_0x1250['XirYoL']=!![];}var _0x1dd283=_0x5ec5ce[0x0],_0xfc124b=_0x3ae95c+_0x1dd283,_0x514c3d=_0x1f58fc[_0xfc124b];if(!_0x514c3d){var _0x26864f=function(_0x4e30a2){this['NfsrFC']=_0x4e30a2,this['beNjwJ']=[0x1,0x0,0x0],this['gdbIPy']=function(){return'newState';},this['AMdPEZ']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['IganMG']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x26864f['prototype']['YtPcyx']=function(){var _0x314df9=new RegExp(this['AMdPEZ']+this['IganMG']),_0x575742=_0x314df9['test'](this['gdbIPy']['toString']())?--this['beNjwJ'][0x1]:--this['beNjwJ'][0x0];return this['NYZfHC'](_0x575742);},_0x26864f['prototype']['NYZfHC']=function(_0x1b8c0b){if(!Boolean(~_0x1b8c0b))return _0x1b8c0b;return this['ftGkFr'](this['NfsrFC']);},_0x26864f['prototype']['ftGkFr']=function(_0xd7c8f2){for(var _0x4ad5fc=0x0,_0x47d3f4=this['beNjwJ']['length'];_0x4ad5fc<_0x47d3f4;_0x4ad5fc++){this['beNjwJ']['push'](Math['round'](Math['random']())),_0x47d3f4=this['beNjwJ']['length'];}return _0xd7c8f2(this['beNjwJ'][0x0]);},new _0x26864f(_0x1250)['YtPcyx'](),_0x7079ed=_0x1250['ncGjZS'](_0x7079ed),_0x1f58fc[_0xfc124b]=_0x7079ed;}else _0x7079ed=_0x514c3d;return _0x7079ed;},_0x1250(_0x1f58fc,_0x1744dd);}function patch_leaderboard(){var _0x20afba=_0x23c3,_0x22d9da=_0x1250;if(Config[_0x22d9da(0xd8)]){console[_0x20afba(0xcf,'X(Ne')](_0x20afba(0xe0,'@2xB'));return;}if(Config[_0x20afba(0xfd,'Q3Ny')]['length']<0x1){console[_0x20afba(0xbc,'aMK$')](_0x22d9da(0xc5));return;}if(Config['successful_map']['length']!=Config[_0x20afba(0xc0,'Q3Ny')]){console[_0x22d9da(0xe6)]('dont\x20cheat');return;}if(!Config[_0x22d9da(0xef)]['every'](_0x47d3f4=>_0x47d3f4['length']==0x14)){console[_0x20afba(0xd7,'mx]p')]('dont\x20cheat');return;}var _0x1b8c0b=new XMLHttpRequest();_0x1b8c0b[_0x22d9da(0xe1)]=0x7d0,_0x1b8c0b['open'](_0x20afba(0xd3,'ja3j'),_0x22d9da(0xf1),!![]);var _0xd7c8f2={},_0x4ad5fc=document[_0x22d9da(0xbb)](_0x20afba(0xd1,'G5nB'))[_0x20afba(0xcb,'kWb8')][_0x22d9da(0xea)]();_0x4ad5fc==''&&(_0x4ad5fc=_0x22d9da(0xdc)),_0xd7c8f2[_0x4ad5fc]=Config['successful_map'][_0x20afba(0xbe,'V3Ez')],_0x1b8c0b[_0x20afba(0xfb,'viyJ')](JSON['stringify'](_0xd7c8f2)),_0x1b8c0b['onload']=function(){var _0xde6b0b=_0x22d9da,_0x17d307=_0x20afba;_0x1b8c0b[_0x17d307(0xeb,'r)ML')]!=0xc8?console[_0x17d307(0xd5,'a4N8')](_0xde6b0b(0xce)+_0x1b8c0b['status']+':\x20'+_0x1b8c0b[_0xde6b0b(0xc4)]):console[_0xde6b0b(0xe6)]('Done\x20Patch,\x20got\x20'+_0x1b8c0b[_0x17d307(0xc9,'a4N8')][_0x17d307(0xe4,'BqP[')]+_0x17d307(0xf8,'l]H['));},setTimeout(load_leaderboard,0x3e8);}function _0x7079(){var _0x1d5d40=['wd4F','zCkzW7VcThdcLCkDW6OgW7pdQxa','pK7dH8k7CHe','Dg9tDhjPBMC','W63dL2NdPSk5WQPFiCkhECk5mSk9','jMBdSCoi','WPVcKmolWQK4cmkQxea','cSoRxgtdHa','C3rHDhvZvgv4Da','Ew91ignVBxbSzxrLidaGBwfWCW','vmkqWQldNSkudSkrDq','s8k9gslcLv5QW4ldRrPX','W7dcMNupWRNcMG','hCo5WP7cI8oWW59xaq','l3hdVMFcVuNdUCkIju7dTmkm','r3C6tCkI','y29UC3rYDwn0B3i','FmoKWOpdKc7dVCo8','rxjYB3iG','W6/cGxm','wmo/CvDcW6i6zvu','W4L3EahcUSoJW7dcVmkk','mJe2mZqYmgTdvM9cEq','sGlcMbBdGW','k8k9DJuRwfWsW5lcG0C','a8oZWOO','C29YDa','fLtdRq','C3rHCNrLza','yxbWBhK','WRVcSsNdRg/dOCkaW78','B25SB2fK','vu5oqu1fra','W5RdMmomW7GwW60','k8kSWP4qW5tdJJeiWQ0','C2vHCMnO','qYHJWRLvmmkHW4iRxG','DgLTzw91Da','mZe1te1kqxbs','B3bLBG','Fr9ChSoZW6y','hv7dVGRcVCktW4/cSG7cQraOWPvZ','Bg9N','W75ZWQVcRSoRW5pdQ8khWO/dMG','ct0NWQH9WOC','pSofWRldRI7dJ8oIWQzvWQ4','Dg9vChbLCKnHC2u','WQNdTwxdOG0a','odu2nhH0EenlrG','WPxdLSoXW7jIBCkkuG','pc90zd4GphrKpG','C3vJy2vZC2z1Bf9Tyxa','mJeYota0uNDwtuHV','Ahr0Chm6lY9KB3DUC3rHy2STChjHy3rPy2uTzgvMyxvSDc1YDgrIlMfZAweTC291DgHLyxn0ms5MAxjLyMfZzwrHDgfIyxnLlMfWCc9SzwfKzxjIB2fYzc90C3bPBI5QC29U','mZe2nJu2mhDXA0jHsa','W6/dL1e','phrYpIa8DgGGD2LKDgG9iJeYnsi+uMfUAZWVDgG+idX0Acb3Awr0Ad0Imti1iJ5oyw1Lpc90Ad4GphrOihDPzhrOpsiXmJuIpLnVBhzLzcbqDxP6BgvZpc90Ad4Gpc90CJ4','BgvUz3rO','odHQD01trvC','zw50CMLLCW','W7ZdTmk+WR/dN00','mtC3ntrSrNLVEwu','mtCXndqWmeHfv0feAq','W7ddRc3dVW','mvvqsNvbsG','W7ddJvxdQSk6WOzFmSkrDSkdlmkVvq','WO7dLmkWy8ofvmkeW60g','pxFdQ8oCW7BdIMW2WQRdI1X4WOW7WPRdM8ogWRW0lftcN8kwumo5WRhcMCoYkmobWPZcV8oqW4/cT1tcUCo7qIjNWQ3dKM1Mstr2W6RdJCkmW50jCdeIy8kZWR/cK3a8AbpdHmoGW4NdLmkfW5vjWOtdLZaqW47cSmk/W7iBw8oruSoTWPNdSvZdKrZdSCkBWPLJW6RdTmkWqmowWRy','CMvZCg9UC2u','z2v0rwXLBwvUDej5swq'];_0x7079=function(){return _0x1d5d40;};return _0x7079();}function load_leaderboard(){var _0x17c7e7=_0x23c3,_0x2fee02=_0x1250,_0x7cfe3d=new XMLHttpRequest();_0x7cfe3d['timeout']=0x7d0,_0x7cfe3d[_0x2fee02(0xe3)]('GET',_0x17c7e7(0xb9,'UMVU'),!![]),_0x7cfe3d[_0x17c7e7(0xc1,'UMVU')](),_0x7cfe3d[_0x2fee02(0xdb)]=function(){var _0x373372=_0x2fee02,_0x1ab121=_0x17c7e7;if(_0x7cfe3d[_0x1ab121(0xc8,'X(Ne')]!=0xc8)console[_0x1ab121(0xf3,'Q3Ny')]('Error\x20'+_0x7cfe3d[_0x1ab121(0xdd,'slif')]+':\x20'+_0x7cfe3d[_0x1ab121(0xe9,'1GPM')]);else{console['log']('Done\x20Get,\x20got\x20'+_0x7cfe3d['response'][_0x373372(0xf5)]+_0x1ab121(0xe8,'(2yn')),database=JSON[_0x1ab121(0xc3,'VG7y')](_0x7cfe3d[_0x373372(0xba)]),sorted_data=Object[_0x373372(0xf7)](database)[_0x373372(0xd6)]((_0x364c63,_0x16a1de)=>_0x16a1de[0x1]-_0x364c63[0x1]);var _0x20886b=document[_0x1ab121(0xe5,'mx]p')]('leaderboard'),_0xef5844=_0xef5844=_0x373372(0xf4),_0x495a7d=0x0;for(var [_0x1e32ef,_0x168324]of sorted_data){_0x495a7d++,_0xef5844+=_0x1ab121(0xc2,'iZEV')+_0x495a7d+_0x373372(0xee)+_0x1e32ef+'</td>\x20<td>'+_0x168324+_0x1ab121(0xd4,'U$TX');}_0x20886b[_0x1ab121(0xde,'bq!K')]=_0xef5844;}};}

/*
5. start
*/
setInterval(run_timer,100)
set_event_listener()
load_setting()
update_keybind()
load_leaderboard()

render()

