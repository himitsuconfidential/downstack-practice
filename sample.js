var shape_table = {'Z': [[[1, 0], [0, 2], [1, 1], [0, 1]],  [[1, 0], [1, 1], [2, 1], [0, 0]]],
               'L': [[[1, 0], [0, 1], [2, 0], [0, 0]], [[0, 1], [0, 2], [1, 2], [0, 0]], [[0, 1], [1, 1], [2, 0], [2, 1]], [[1, 0], [1, 1], [1, 2], [0, 0]]],
               'O': [[[1, 0], [0, 1], [1, 1], [0, 0]]],
               'S': [[[0, 1], [1, 1], [1, 2], [0, 0]], [[1, 0], [1, 1], [2, 0], [0, 1]]],
               'I': [[[1, 0], [2, 0], [0, 0], [3, 0]],  [[0, 1], [0, 2], [0, 3], [0, 0]]],
               'J': [[[0, 1], [1, 1], [2, 1], [0, 0]], [[0, 1], [1, 0], [0, 2], [0, 0]], [[1, 0], [2, 0], [2, 1], [0, 0]], [[1, 0], [1, 1], [1, 2], [0, 2]]],
               'T': [[[0, 1], [0, 2], [1, 1], [0, 0]], [[1, 0], [1, 1], [2, 0], [0, 0]], [[1, 0], [1, 1], [1, 2], [0, 1]], [[1, 0], [1, 1], [2, 1], [0, 1]]],
};
function autopaint(positions){
    
    if (positions.length != 4){
        console.log('fail');
        return 'G';
    }
    var min_i=99;
    var min_j=99;
    
    for (position of positions){
        var j = position[0];
        var i = position[1];
        if (j < min_j){
            min_j = j;
        }
            
        if (i < min_i){
            min_i = i;
        }
            
    }
    var offseted_positions = [];
    for (var position of positions){
        j = position[0];
        i = position[1];
        offseted_positions.push([j-min_j, i-min_i]);
    }
    
    for (var piece in shape_table) {
        //console.log(piece, offseted_positions.toString(),is_element(offseted_positions, shape_table[piece]))
        if (shape_table.hasOwnProperty(piece) && is_element(offseted_positions, shape_table[piece])) {
            
            console.log('the system has detected the piece is', piece);
            return piece;
        }
    }
    function positions_equal(positions1, positions2){
        if (positions1.length != positions2.length){
            return false;
        }
        for (var position1 of positions1){
            var found = false;
            for (var position2 of positions2){
                if (position1[0] == position2[0] && position1[1] == position2[1]){
                    found = true;
                }
            }
            if (found == false){
                return false;
            }
        }
        return true;
    }
    function is_element(positions1, query){
        for (var positions of query){
            if (positions_equal(positions1, positions)){
                return true;
            }
        }
        return false;
    }
            
}



autopaint([[1, 0], [0, 2], [1, 1], [0, 1]]);
autopaint([[2, 1], [1, 3], [2, 2], [1, 2]]);
autopaint([[2, 1], [2, 2], [3, 1], [2, 0]]);