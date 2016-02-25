function ValidationStep2 ($_POST) {
    function validation_data()
    {
        var $data = {};

        $data['sph_left'] = $_POST['sph_left'];
        $data['sph_right'] = $_POST['sph_right'];
        $data['cyl_left'] = $_POST['cyl_left'];
        $data['cyl_right'] = $_POST['cyl_right'];
        $data['axis_left'] = $_POST['axis_left'];
        $data['axis_right'] = $_POST['axis_right'];
        $data['pd'] = $_POST['pd'];
        $data['new_pd'] = $_POST['new_pd'];
        $data['check']  = $_POST['check'];
        $data['pd2'] = $_POST['pd2'];

        // check different polar SPH
        if($data['sph_left'] <= 0 && $data['sph_right'] <= 0 ||
            $data['sph_left'] >= 0 && $data['sph_right'] >= 0)
        {
            //if CYL select && AXIS don't select - return err||
            if( String($data['cyl_left']).match(/\d+/) && String($data['axis_left']).match(/\d+/) ||
                String($data['cyl_right']).match(/\d+/) && String($data['axis_right']).match(/\d+/) )
            {
                return {'success' : false, 'text' : 'You must select AXIS'};
            }else
            {
                if($data['new_pd'] == 'false')
                {
                    if($data['pd'] == 'none')
                    {
                        return{'success' : false, 'text' : 'Please, select a Pupillary Distance'};
                    }
                }else
                {
                    if($data['pd'] == 'none' && $data['pd2'] == 'none')
                    {
                        return {'success' : false, 'text' : 'Please, select a Pupillary Distance'};
                    }
                }
                if($data['check'] != 'false' )
                {
                    return {'success' : true,'indexes_lens' : validation_recipe($data)}        ;
                }
                else
                {
                    return {'success' : false, 'text' : 'Please, confirm this recipe'};
                }
            }
        }else
        {
            return {'success' : false, 'text' : 'You just pick one of SPH + other  -'};

        }
    }

    /**
     * check  recipe is correct,&& create price on next step
     */
    function validation_recipe($data)
    {
        var $type = $_POST['type'];

        $data['cyl_left'] = Math.abs($data['cyl_left']);
        $data['cyl_right'] = Math.abs($data['cyl_right']);
        var $cyl_max = Math.ceil(Math.max($data['cyl_left'],$data['cyl_right']));
        if($cyl_max <= 2)
        {
            $cyl_max = 2;
        }

        if($type == 1 || $type == 3)
        {
            //validation left eyes
            $data['cyl'] = $data['cyl_left'];
            $data['sph'] = $data['sph_left'];
            var $index_left = validation_one_eyes_type_1_3($data);

            //validation right eyes
            $data['cyl'] = $data['cyl_right'];
            $data['sph'] = $data['sph_right'];
            var $index_right = validation_one_eyes_type_1_3($data);

            if($data['cyl_right'] >= $data['cyl_left'])
            {
                var $max_index = $index_right;
                var $min_index = $index_left;
                var $index_array = add_max_index($min_index,$max_index);
            }else
            {
                $max_index = $index_left;
                $min_index = $index_right;
                $index_array = add_max_index($min_index,$max_index);
            }
            var $lens_index = get_full_index_array($max_index,$min_index);

            return $lens_index;
        }else if($type == 2)
        {
            //validation left eyes
            $data['cyl'] = $data['cyl_left'];
            $data['sph'] = $data['sph_left'];
            $index_left = validation_one_eyes_type_2($data);

            //validation right eyes
            $data['cyl'] = $data['cyl_right'];
            $data['sph'] = $data['sph_right'];
            $index_right = validation_one_eyes_type_2($data);
            if($data['cyl_right'] >= $data['cyl_left'])
            {
                $max_index = $index_right;
                $min_index = $index_left;
                $index_array = add_max_index($min_index,$max_index);
            }else
            {
                $max_index = $index_left;
                $min_index = $index_right;
                $index_array = add_max_index($min_index,$max_index);
            }
            $lens_index = get_full_index_array($max_index,$min_index);
            return $lens_index;


        }else
        {
            var $alert = 'Wrong type lens';
        }
    }

    function get_full_index_array($max_array,$min_array)
    {
        var $min_index_max_array = Math.min.apply(Math, $max_array);
        var $min_index_min_array = Math.min.apply(Math, $min_array);
        var $max_index_max_array = Math.max.apply(Math, $max_array);
        var $max_index_min_array = Math.max.apply(Math, $min_array);

        if($min_index_max_array < $min_index_min_array)
        {
            var $result_array = {};
            for(var $index in $max_array)
            {
                if ($max_array.hasOwnProperty($index)) {
                    if ($index >= $min_index_min_array) {
                        $result_array[$index] = $max_array[$index];
                    }
                }
            }
        }else
        {
            $result_array = $max_array;
        }

        if($max_index_max_array < $max_index_min_array)
        {
            for( var $index in $min_array )
            {
                if ($min_array.hasOwnProperty($index)) {
                    if ($max_index_max_array < $index) {
                        $result_array[$index] = $min_array[$index];
                    }
                }
            }
        }

        return $result_array;




    }



    /** select side why have max CYL
     * && find missing max index from min CYL
     * @param $data - cyl_left,cyl_right
     * @param $index_left - index for left eyes
     * @param $index_right - index for right eyes
     * @return array missing index
     */
    function add_max_index($min_indexes,$max_indexes)
    {
        var $same_index = get_same_index($max_indexes,$min_indexes);

        var $max_keys=  Math.max.apply(Math, $max_indexes);
        var $index_array = {};
        for (var $key in $min_indexes )
        {
            if ($min_indexes.hasOwnProperty($key)) {
                if ($max_keys < $key) {
                    $index_array[$key] = $min_indexes[$key];
                }
            }
        }


        return jQuery.merge($same_index, $index_array);
    }

    /** get same index in two array
     * @param $array1
     * @param $array2
     * @return array - array with same indexes
     */
    function get_same_index($array1,$array2)
    {
        var $index_array =  {};
        for(var $index in $array1)
        {
            if ($array1.hasOwnProperty($index)) {
                if ($array2[$index]) {
                    $index_array[$index] = $array1[$index];
                }
            }
        }
        return $index_array;
    }

//price information about CYL index
    function type_1_3_index_price()
    {
        if($_POST['type'] == 1)
        {
            var $data = type_1_index_price();
        }else if($_POST['type'] == 3)
        {
            var $data = type_3_index_price();
        }

        return $data;
    }

    function type_1_index_price()
    {
        var $data = {};

        if (!$data[2]) {
            $data[2] = {};
        }

        $data[2]['1.5'] = 200;
        $data[2]['1.56'] = 250;
        $data[2]['1.61'] = 450;
        $data[2]['1.67'] = 800;
        $data[2]['1.74'] = 1000;
        $data[2]['1.74M'] = 1900;

        if (!$data[3]) {
            $data[3] = {};
        }

        $data[3]['1.5'] = 290;
        $data[3]['1.5M'] = 600;
        $data[3]['1.56'] = 320;
        $data[3]['1.56M'] = 800;
        $data[3]['1.61'] = 600;
        $data[3]['1.61M'] = 1200;
        $data[3]['1.67'] = 1000;
        $data[3]['1.67M'] = 1750;
        $data[3]['1.74'] = 1500;
        $data[3]['1.74M'] = 1900;

        if (!$data[4]) {
            $data[4] = {};
        }

        $data[4]['1.56'] = 400;
        $data[4]['1.56M'] = 800;
        $data[4]['1.61'] = 800;
        $data[4]['1.61M'] = 1300;
        $data[4]['1.67'] = 1500;
        $data[4]['1.67M'] = 1850;
        $data[4]['1.74'] = 1650;
        $data[4]['1.74M'] = 2000;

        return $data;
    }

    function type_2_index_price()
    {
        var $data = {};

        if (!$data[2]) {
            $data[2] = {};
        }

        $data[2]['1.56'] = 800;
        $data[2]['1.56M'] = 1200;
        $data[2]['1.6'] = 1200;
        $data[2]['1.6M'] = 1500;
        $data[2]['1.67M'] = 2000;

        if (!$data[3]) {
            $data[3] = {};
        }

        $data[3]['1.56M'] = 1200;
        $data[3]['1.6'] = 1500;
        $data[3]['1.6M'] = 1500;
        $data[3]['1.67M'] = 2000;

        if (!$data[4]) {
            $data[4] = {};
        }

        $data[4]['1.56M'] = 1500;
        $data[4]['1.6M'] = 1800;
        $data[4]['1.67M'] = 2300;

        return $data;
    }



    function type_3_index_price()
    {
        var $data = {};

        if (!$data[2]) {
            $data[2] = {};
        }

        $data[2]['1.5'] = 300;
        $data[2]['1.56'] = 350;
        $data[2]['1.61'] = 450;
        $data[2]['1.67'] = 900;
        $data[2]['1.74'] = 1100;
        $data[2]['1.74M'] = 2000;

        if (!$data[3]) {
            $data[3] = {};
        }

        $data[3]['1.5'] = 390;
        $data[3]['1.5M'] = 700;
        $data[3]['1.56'] = 420;
        $data[3]['1.56M'] = 900;
        $data[3]['1.61'] = 700;
        $data[3]['1.61M'] = 1300;
        $data[3]['1.67'] = 1100;
        $data[3]['1.67M'] = 1850;
        $data[3]['1.74'] = 1600;
        $data[3]['1.74M'] = 2000;

        if (!$data[4]) {
            $data[4] = {};
        }

        $data[4]['1.56'] = 500;
        $data[4]['1.56M'] = 900;
        $data[4]['1.61'] = 900;
        $data[4]['1.61M'] = 1400;
        $data[4]['1.67'] = 1600;
        $data[4]['1.67M'] = 1950;
        $data[4]['1.74'] = 1750;
        $data[4]['1.74M'] = 2100;

        return $data;
    }

    function validation_one_eyes_type_1_3($data)
    {
        var $index_valid;
        if($data['cyl'] <= 2)
        {
            $index_valid = type_1_3_SPH_2($data);
        }else if($data['cyl'] <= 3)
        {
            $index_valid = type_1_3_SPH_3($data);
        }else if($data['cyl'] <= 4)
        {
            $index_valid = type_1_3_SPH_4($data);
        }
        return $index_valid;
    }

    function validation_one_eyes_type_2($data)
    {
        var $index_valid;

        if($data['cyl'] <= 2)
        {
            $index_valid = type_2_SPH_2($data);
        }else if($data['cyl'] <= 3)
        {
            $index_valid = type_2_SPH_3($data);
        }else if($data['cyl'] <= 4)
        {
            $index_valid = type_2_SPH_4($data);
        }
        return $index_valid;
    }

// VALIDATION IF TYPE 1 || 3 && CYL == 2
    function type_1_3_SPH_2($data)
    {
        var $index_valid;
        //check sph have - || + polar
        if($data['sph'] <= 0)
        {
            $index_valid = type_1_3_SPH_m2_diapasone(Math.abs($data['sph']));
            return $index_valid;
        }else if($data['sph'] >= 0)
        {
            $index_valid =  type_1_3_SPH_p2_diapasone($data['sph']);
            return $index_valid;
        }else
        {
            return {'success' : false, 'text' : 'incorrect sph polar'};
        }
    }

    function type_1_3_SPH_m2_diapasone($sph)
    {
        var $data = type_1_3_index_price();
        var $index_valid = {};
        if($sph <= 4)
        {
            $index_valid['1.5'] = $data[2]['1.5'];
        }
        if($sph <= 8)
        {
            $index_valid['1.56'] = $data[2]['1.56'];
            $index_valid['1.61'] = $data[2]['1.61'];
        }
        if($sph <= 15)
        {
            if($sph >= 3 )
            {
                $index_valid['1.67'] = $data[2]['1.67'];
            }
            if($sph >= 4)
            {
                $index_valid['1.74'] = $data[2]['1.74'];
            }
        }

        return $index_valid;
    }

    function type_1_3_SPH_p2_diapasone($sph)
    {
        var $data = type_1_3_index_price();
        var $index_valid = {};
        if($sph <= 6)
        {
            $index_valid['1.5'] = $data[2]['1.5'];
            $index_valid['1.56'] = $data[2]['1.56'];
            $index_valid['1.61'] = $data[2]['1.61'];
            if($sph >= 1)
            {
                $index_valid['1.67'] = $data[2]['1.67'];
            }
            if($sph >= 3)
            {
                $index_valid['1.74M'] = $data[2]['1.74M'];
            }
        }
        return $index_valid;
    }


// VALIDATION IF TYPE 1 || 3 && CYL == 3

    function type_1_3_SPH_3($data)
    {
        var $index_valid;
        if($data['sph'] <= 0)
        {
            $index_valid = type_1_3_SPH_m3_diapasone(Math.Math.abs($data['sph']));
            return $index_valid;
        }else if($data['sph'] >= 0)
        {
            $index_valid =  type_1_3_SPH_p3_diapasone($data['sph']);
            return $index_valid;
        }else
        {
            return {'success' : false, 'text' : 'incorrect sph polar'};
        }
    }

    function type_1_3_SPH_m3_diapasone($sph)
    {
        var $data = type_1_3_index_price();
        var $index_valid = {};
        if($sph <= 6)
        {
            $index_valid['1.5'] = $data[3]['1.5'];
            $index_valid['1.56'] = $data[3]['1.56'];
        }
        if($sph <= 8)
        {
            $index_valid['1.61'] = $data[3]['1.61'];
            if($sph >= 3)
            {
                $index_valid['1.67'] = $data[3]['1.67'];
            }
            if($sph >= 4)
            {
                $index_valid['1.74'] = $data[3]['1.74'];
            }
        }
        if($sph >= 8.25 && $sph <= 12)
        {
            $index_valid['1.61M'] = $data[3]['1.61M'];
        }
        if($sph >= 8.25 && $sph <= 15)
        {
            $index_valid['1.67M'] = $data[3]['1.67M'];
            $index_valid['1.74M'] = $data[3]['1.74M'];
        }
        return $index_valid;
    }

    function type_1_3_SPH_p3_diapasone($sph)
    {
        var $data = type_1_3_index_price();
        var $index_valid = {};
        if($sph <= 3)
        {
            $index_valid['1.5'] = $data[3]['1.5'];
        }
        if($sph <= 4)
        {
            $index_valid['1.56'] = $data[3]['1.56'];
        }if($sph <= 6)
    {
        $index_valid['1.61M'] = $data[3]['1.61M'];
        if($sph >= 2)
        {
            $index_valid['1.67M'] = $data[3]['1.67M'];
        }
        if($sph >= 3)
        {
            $index_valid['1.74M'] = $data[3]['1.74M'];
        }
        if($sph >= 4.25)
        {
            $index_valid['1.56M'] = $data[3]['1.56M'];
        }
    }
        return $index_valid;
    }

// VALIDATION IF TYPE 1 || 3 && CYL == 4

    function type_1_3_SPH_4($data)
    {
        var $index_valid;
        if($data['sph'] <= 0)
        {
            $index_valid =  type_1_3_SPH_m4_diapasone(Math.abs($data['sph']));
            return $index_valid;
        }else if($data['sph'] >= 0)
        {
            $index_valid =  type_1_3_SPH_p4_diapasone($data['sph']);
            return $index_valid;
        }else
        {
            return {'success' : false, 'text' : 'incorrect sph polar'};
        }
    }

    function type_1_3_SPH_m4_diapasone($sph)
    {
        var $data = type_1_3_index_price();
        var $index_valid = {};
        if($sph <= 4)
        {
            $index_valid['1.61'] = $data[4]['1.61'];
        }
        if($sph <= 6)
        {
            $index_valid['1.56'] = $data[4]['1.56'];
        }
        if($sph <= 8)
        {
            if($sph >= 3)
            {
                $index_valid['1.67'] = $data[4]['1.67'];
            }
            if($sph >= 4)
            {
                $index_valid['1.74'] = $data[4]['1.74'];
            }
            if($sph >= 6.25)
            {
                $index_valid['1.56M'] = $data[4]['1.56M'];
            }
        }
        if($sph <= 12 && $sph >= 4.25)
        {
            $index_valid['1.61M'] = $data[4]['1.61M'];
        }
        if($sph <= 15 && $sph >= 8.25)
        {
            $index_valid['1.67M'] = $data[4]['1.67'];
            $index_valid['1.74M'] = $data[4]['1.74M'];
        }
        return $index_valid;
    }

    function type_1_3_SPH_p4_diapasone($sph)
    {
        var $data = type_1_3_index_price();
        var $index_valid = {};
        if($sph <= 4)
        {
            $index_valid['1.56'] = $data[4]['1.56'];
        }
        if($sph <= 6)
        {
            $index_valid['1.61M'] =
                $index_valid['1.56'] = $data[4]['1.61M'];
            if($sph >= 2)
            {
                $index_valid['1.67M'] = $data[4]['1.67M'];
            }
            if($sph >= 3)
            {
                $index_valid['1.74M'] = $data[4]['1.74M'];
            }
            if($sph >= 4.25)
            {
                $index_valid['1.56M'] = $data[4]['1.56M'];
            }
        }
        return $index_valid;
    }

// VALIDATION IF TYPE 2 && CYL == 2
    function type_2_SPH_2($data)
    {
        var $index_valid;

        //check sph have - || + polar
        if($data['sph'] <= 0)
        {
            $index_valid = type_2_SPH_m2_diapasone(Math.abs($data['sph']));
            return $index_valid;
        }else if($data['sph'] >= 0)
        {
            $index_valid =  type_2_SPH_p2_diapasone($data['sph']);
            return $index_valid;
        }else
        {
            return {'success' : false, 'text' : 'incorrect sph polar'};
        }
    }


    function type_2_SPH_m2_diapasone($sph)
    {
        var $index_data = type_2_index_price();
        var $index_valid = {};
        if($sph <= 4)
        {
            $index_valid['1.56'] = $index_data[2]['1.56'];
        }
        if($sph <= 6)
        {
            $index_valid['1.6'] = $index_data[2]['1.6'];
        }
        if($sph >= 6.25 && $sph <= 8)
        {
            $index_valid['1.6M'] = $index_data[2]['1.6M'];
        }
        if($sph >=1 && $sph <= 12)
        {
            $index_valid['1.67M'] = $index_data[2]['1.67M'];
        }
        return $index_valid;
    }

    function type_2_SPH_p2_diapasone($sph)
    {
        var $index_data = type_2_index_price();
        var $index_valid = {};
        if($sph <= 6)
        {
            $index_valid['1.56M'] = $index_data[2]['1.56M'];
            $index_valid['1.6M'] = $index_data[2]['1.6M'];
            if($sph >= 1)
            {
                $index_valid['1.67'] = $index_data[2]['1.67'];
            }
        }
        return $index_valid;
    }

//VALIDATION IF TYPE 2 && CYL 3
    function type_2_SPH_3($data)
    {
        var $index_valid;
        //check sph have - || + polar
        if($data['sph'] <= 0)
        {
            $index_valid = type_2_SPH_m3_diapasone(Math.abs($data['sph']));
            return $index_valid;
        }else if($data['sph'] >= 0)
        {
            $index_valid =  type_2_SPH_p3_diapasone($data['sph']);
            return $index_valid;
        }else
        {
            return {'success' : false, 'text' : 'incorrect sph polar'};
        }
    }

    function type_2_SPH_m3_diapasone($sph)
    {
        var $index_data = type_2_index_price();

        var $index_valid = {};
        if($sph <= 6)
        {
            $index_valid['1.56M'] = $index_data[3]['1.56M'];
            $index_valid['1.6'] = $index_data[3]['1.6'];
        }
        if($sph >= 6.25 && $sph <= 8)
        {
            $index_valid['1.6M'] = $index_data[3]['1.6M'];
        }
        if($sph >= 1 && $sph <= 12)
        {
            $index_valid['1.67M'] = $index_data[3]['1.67M'];
        }
        return $index_valid;
    }
    function type_2_SPH_p3_diapasone($sph)
    {
        var $index_data = type_2_index_price();
        var $index_valid = {};
        if($sph <= 6)
        {
            $index_valid['1.56M'] = $index_data[3]['1.56M'];
            $index_valid['1.6M'] = $index_data[3]['1.6M'];
            if($sph >= 1)
            {
                $index_valid['1.67M'] = $index_data[3]['1.67M'];
            }
        }
        return $index_valid;
    }

//VALIDATION IF TYPE 2 && CYL 4
    function type_2_SPH_4($data)
    {
        var $index_valid;
        //check sph have - || + polar
        if($data['sph'] <= 0)
        {
            $index_valid = type_2_SPH_m4_diapasone(Math.abs($data['sph']));
            return $index_valid;
        }else if($data['sph'] >= 0)
        {
            $index_valid =  type_2_SPH_p4_diapasone($data['sph']);
            return $index_valid;
        }else
        {
            return {'success' : false, 'text' : 'incorrect sph polar'};
        }
    }

    function type_2_SPH_m4_diapasone($sph)
    {
        var $index_data = type_2_index_price();
        var $index_valid = {};
        if($sph <= 6)
        {
            $index_valid['1.56M'] = $index_data[4]['1.56M'];
        }
        if($sph <= 8)
        {
            $index_valid['1.6M'] = $index_data[4]['1.6M'];
        }
        if($sph >= 1 && $sph <= 12)
        {
            $index_valid['1.67M'] = $index_data[4]['1.67M'];
        }
        return $index_valid;
    }

    function type_2_SPH_p4_diapasone($sph)
    {
        var $index_data = type_2_index_price();
        var $index_valid = {};
        if($sph <= 6)
        {
            $index_valid['1.56M'] = $index_data[4]['1.56M'];
            $index_valid['1.6M'] = $index_data[4]['1.6M'];
            if($sph >= 1)
            {
                $index_valid['1.67M'] = $index_data[4]['1.67M'];
            }
        }
        return $index_valid;
    }

    return {
        valid: validation_data
    };
}
