var ERROR = 'ERROR';

// Create or Open Database.
var db = window.openDatabase('FGW', '1.0', 'FGW', 40000);

// To detect whether users use mobile phones horizontally or vertically.
$(window).on('orientationchange', onOrientationChange);

// Display messages in the console.
function log(message, type = 'INFO') {
    console.log(`${new Date()} [${type}] ${message}`);
}

function onOrientationChange(e) {
    if (e.orientation == 'portrait') {
        log('Portrait.');
    }
    else {
        log('Landscape.');
    }
}

// To detect whether users open applications on mobile phones or browsers.
if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
    $(document).on('deviceready', onDeviceReady);
}
else {
    $(document).on('ready', onDeviceReady);
}

// Display errors when executing SQL queries.
function transactionError(tx, error) {
    log(`SQL Error ${error.code}. Message: ${error.message}.`, ERROR);
}

// Run this function after starting the application.
function onDeviceReady() {
    log(`Device is ready.`);
    prepareDatabase(db);
    console.log(navigator.vibrate);
    /*db.transaction(function (tx) {
        tx.executeSql('DROP TABLE Estate');
        tx.executeSql('DROP TABLE City');
        tx.executeSql('DROP TABLE Comment');
        tx.executeSql('DROP TABLE District');
        tx.executeSql('DROP TABLE Note');
        tx.executeSql('DROP TABLE Ward');
    });*/
}

$(document).on('pagebeforeshow', '#page-create', function(){
    importCity();
});

$(document).on('change','#page-create #frm-register #city', function(){
    importDistrict();
    importWard();
});

$(document).on('change','#page-create #frm-register #district', function(){
    importWard();
});


function importCity(selectedId = -1){
     db.transaction(function (tx) {
        var query = `SELECT * FROM City ORDER BY Name`;

        tx.executeSql(query, [], transactionSuccess, transactionError);
        
        function transactionSuccess(tx, result){
            var optionList = `<option value='-1'>Select City (required field)</option>`;

            for(let city of result.rows){
               optionList += `<option value='${city.Id}' ${city.Id == selectedId ? 'selected' : ''}>${city.Name}</option>`; 
            }

            $('#page-create #frm-register #city').html(optionList);
            $('#page-create #frm-register #city').selectmenu('refresh', true);
            
        }

    });
}

function importDistrict(selectedId = -1){

    var text = $('#page-create #frm-register #city option:selected').text();
    var cityId = $('#page-create #frm-register #city').val();
    //alert(cityId);
    
    db.transaction(function (tx) {
        //Create table APPARTMENT.
        
        var query = `SELECT * FROM District WHERE CityId = ? ORDER BY Name`;

        tx.executeSql(query, [cityId], transactionSuccess, transactionError);
        
        function transactionSuccess(tx, result){
            var optionList =  `<option value='-1'>Select District (required field)</option>`;

            for(let district of result.rows){
                optionList += `<option value='${district.Id}' ${district.Id == selectedId ? 'selected' : ''}>${district.Name}</option>`;
            }

            $('#page-create #frm-register #district').html(optionList);
            $('#page-create #frm-register #district').selectmenu('refresh', true);
            
        }

    });
}

function importWard(selectedId = -1){

    var text = $('#page-create #frm-register #district option:selected').text();
    var districtId = $('#page-create #frm-register #district').val();
    
    db.transaction(function (tx) {
        //Create table APPARTMENT.
        var query = `SELECT * FROM Ward WHERE DistrictId = ? ORDER BY Name`;
 
        tx.executeSql(query, [districtId], transactionSuccess, transactionError);
      
        
        function transactionSuccess(tx, result){
            var optionList = `<option value='-1'>Select Ward (required field)</option>`;

            for(let ward of result.rows){
                optionList += `<option value='${ward.Id}' ${ward.Id == selectedId ? 'selected' : ''}>${ward.Name}</option>`;
            }

            $('#page-create #frm-register #ward').html(optionList);
            $('#page-create #frm-register #ward').selectmenu('refresh', true);
            
        }

     });
}


// Submit a form to register a new account.
$(document).on('submit', '#page-create #frm-register', confirmEstate);
$(document).on('submit', '#page-create #frm-confirm', registerEstate);

function confirmEstate(e) {
    e.preventDefault();

    // Get user's input.
    var Apname = $('#page-create #frm-register #Apname').val();
    var Apaddress =  $('#page-create #frm-register #Apaddress').val();
    var city =  $('#page-create #frm-register #city option:selected').text();
    var district = $('#page-create #frm-register #district option:selected').text();
    var ward = $('#page-create #frm-register #ward option:selected').text();
    var type = $('#page-create #frm-register #type option:selected').text();
    var furniture = $('#page-create #frm-register #furniture option:selected').text();
    var bedroom =  $('#page-create #frm-register #Bedroom').val();
    var price = $('#page-create #frm-register #Rentprice').val();
    var reporter = $('#page-create #frm-register #Reporter').val();
    

      //var Note = $('#page-create #frm-confirm #Note').val();
    checkEstate(Apname, Apaddress, city, district, ward, type, bedroom, price, furniture, reporter);
    
}

function checkEstate(Apname, Apaddress, city, district, ward, type, bedroom, price, furniture, reporter) {
    var name = $('#page-create #frm-register #Apname').val();
    db.transaction(function (tx) {
        var query = 'SELECT * FROM Estate WHERE Name = ?';
        tx.executeSql(query, [name], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            if (result.rows[0] == null) {
                log('Open the confirmation popup.');

                $('#page-create #error').empty();
                
                $('#page-create #frm-confirm #Apname').val(Apname);
                $('#page-create #frm-confirm #Apaddress').val(Apaddress);
                $('#page-create #frm-confirm #city').val(city);
                $('#page-create #frm-confirm #district').val(district);
                $('#page-create #frm-confirm #ward').val(ward);
                $('#page-create #frm-confirm #type').val(type);
                $('#page-create #frm-confirm #Bedroom').val(bedroom);
                $('#page-create #frm-confirm #Rentprice').val(price);
                $('#page-create #frm-confirm #furniture').val(furniture);
                $('#page-create #frm-confirm #Reporter').val(reporter);
                
                $('#page-create #frm-confirm').popup('open');

            }
            else {
                var error = 'Estate exists.';
                $('#page-create #error').empty().append(error);
                log(error, ERROR);
            }
        }
    });
}

function registerEstate(e) {
    e.preventDefault();

    var Apname = $('#page-create #frm-confirm #Apname').val();
    var Apaddress = $('#page-create #frm-confirm #Apaddress').val();
    var city =  $('#page-create #frm-confirm #city').val();
    var district = $('#page-create #frm-confirm #district').val();
    var ward = $('#page-create #frm-confirm #ward').val();
    var type = $('#page-create #frm-confirm #type').val();
    var bedroom =  $('#page-create #frm-confirm #Bedroom').val();
    var price = $('#page-create #frm-confirm #Rentprice').val();
    var Furniture = $('#page-create #frm-confirm #furniture').val();
    //var Note = $('#page-create #frm-confirm #Note').val();
    var Reporter = $('#page-create #frm-confirm #Reporter').val();
    var dateTime = new Date();

    db.transaction(function (tx) {
        var query = 'INSERT INTO Estate (Name, Street, City, District, Ward, Type, Bedroom, Price, Furniture, Reporter, DateAdded) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        tx.executeSql(query, [Apname, Apaddress, city, district, ward, type, bedroom, price, Furniture, Reporter, dateTime ], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Create a Estate name '${Apname}' successfully.`);

            // Reset the form.
            $('#frm-register').trigger('reset');
            $('#page-create #error').empty();
            $('#apname').focus();

            $('#page-create #frm-confirm').popup('close');
        }
    });
}

// Display Account List.
$(document).on('pagebeforeshow', '#page-list', showList);

function showList() {
    db.transaction(function (tx) {
        var query = 'SELECT Name, Street, City, District, Ward, Price, Bedroom, Id FROM Estate';
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Get list of estate successfully.`);

            // Prepare the list of accounts.
            var listEstate = `<ul id='list-estate' data-role='listview' data-filter='true' data-filter-placeholder='Search...'data-corners='false' class='ui-nodisc-icon ui-alt-icon'>`;
          
                                                     
            for (let estate of result.rows) {
                listEstate += `<li><a data-details='{"Id" : ${estate.Id}}'>
                                    <img src='img/houselogo.jpg'>
                                    <h5>Estate name: ${estate.Name}</h5>
                                    <p>Bedroom: ${estate.Bedroom}</p>
                                    <p>Street: ${estate.Street}</p>
                                    <p>Address: ${estate.City}, ${estate.District}, ${estate.Ward}</p>
                                    <p>Price: ${estate.Price} VNĐ/Month </P>
                                </a></li>`;
            }
            listEstate += `</ul>`;

            // Add list to UI.
            $('#list-estate').empty().append(listEstate).listview('refresh').trigger('create');

            log(`Show list of estates successfully.`);
        }
    });
}

// Save Estate Id.
$(document).on('vclick', '#list-estate li a', function (e) {
    e.preventDefault();

    var id = $(this).data('details').Id;
    localStorage.setItem('currentEstateId', id);

    $.mobile.navigate('#page-detail', { transition: 'none' });
});

// Show Account Details.
$(document).on('pagebeforeshow', '#page-detail', showDetail);

function showDetail() {
    var id = localStorage.getItem('currentEstateId');

    db.transaction(function (tx) {
        var query = 'SELECT * FROM Estate WHERE Id = ?';
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var errorMessage = 'Estate not found.';
            var name = errorMessage;
            var street = errorMessage;
            

            if (result.rows[0] != null) {
                log(`Get details of estate '${id}' successfully.`);
                
                name = result.rows[0].Name;
                street = result.rows[0].Street;
                city = result.rows[0].City;
                district = result.rows[0].District;
                ward = result.rows[0].Ward;
                type = result.rows[0].Type;
                bedroom = result.rows[0].Bedroom;
                price = result.rows[0].Price;
                furniture = result.rows[0].Furniture;
                reporter = result.rows[0].Reporter;
                date = result.rows[0].DateAdded
            }
            else {
                log(errorMessage, ERROR);

                $('#page-detail #btn-update').addClass('ui-disabled');
                $('#page-detail #btn-delete-confirm').addClass('ui-disabled');
            }

            $('#page-detail #id').val(id);
            $('#page-detail #esname').val(name);
            $('#page-detail #esstreet').val(street);
            $('#page-detail #city').val(city);
            $('#page-detail #district').val(district);
            $('#page-detail #ward').val(ward);
            $('#page-detail #type').val(type);
            $('#page-detail #bedroom').val(bedroom);
            $('#page-detail #price').val(price);
            $('#page-detail #furniture').val(furniture);
            $('#page-detail #reporter').val(reporter);
            $('#page-detail #date').val(date);
            
            showComment();
        }
    });
}

// Update Estate.
$(document).on('submit', '#page-detail #frm-update', updateEstate);
$(document).on('submit', '#page-detail #frm-update', confirmUpdateEstate);

function confirmUpdateEstate() {
    var id = $('#page-detail #id').val();
    db.transaction(function (tx) {
        var query = 'SELECT * FROM Estate WHERE Id = ?';
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var errorMessage = 'Estate not found.';
            var name = errorMessage;

            if (result.rows[0] != null) {
                log(`Get details of estate '${id}' successfully.`);
                
                name = result.rows[0].Name;
                street = result.rows[0].Street;
                city = result.rows[0].City;
                district = result.rows[0].District;
                ward = result.rows[0].Ward;
                type = result.rows[0].Type;
                bedroom = result.rows[0].Bedroom;
                price = result.rows[0].Price;
                furniture = result.rows[0].Furniture;
                reporter = result.rows[0].Reporter;
                date = result.rows[0].DateAdded
            }
            else {
                log(errorMessage, ERROR);

                $('#page-detail #btn-update').addClass('ui-disabled');
                $('#page-detail #btn-delete-confirm').addClass('ui-disabled');
            }

            $('#page-detail #frm-update #id').val(id);
            $('#page-detail #frm-update #esname').val(name);
            $('#page-detail #frm-update #esstreet').val(street);
            $('#page-detail #frm-update #city').val(city);
            $('#page-detail #frm-update #district').val(district);
            $('#page-detail #frm-update #ward').val(ward);
            $('#page-detail #frm-update #type').val(type);
            $('#page-detail #frm-update #bedroom').val(bedroom);
            $('#page-detail #frm-update #price').val(price);
            $('#page-detail #frm-update #furniture').val(furniture);
            $('#page-detail #frm-update #reporter').val(reporter);
            $('#page-detail #frm-update #date').val(date);
            
            showComment();
        }
    });
}

function updateEstate(e) {
    e.preventDefault();

    var Apname = $('#page-detail #frm-update #esname').val();
    var Apaddress = $('#page-detail #frm-update #esstreet').val();
    var city =  $('#page-detail #frm-update #city').val();
    var district = $('#page-detail #frm-update #district').val();
    var ward = $('#page-detail #frm-update #ward').val();
    var type = $('#page-detail #frm-update #type').val();
    var bedroom =  $('#page-detail #frm-update #bedroom').val();
    var price = $('#page-detail #frm-update #price').val();
    var Furniture = $('#page-detail #frm-update #furniture').val();
    //var Note = $('#page-create #frm-confirm #Note').val();
    var Reporter = $('#page-detail #frm-update #reporter').val();
    var id = localStorage.getItem('currentEstateId');
    var dateTime = new Date();
    db.transaction(function (tx) {
        var query = `UPDATE Estate
                        SET Name = ?,
                            Street = ?, City = ?, District = ?, Ward = ?,
                            Type = ?, Bedroom = ?, Price = ?, Furniture = ?, Reporter = ?,
                            DateAdded = ?
                        WHERE Id = ?`;
        tx.executeSql(query, [Apname, Apaddress, city, district, ward, type, bedroom, price, Furniture, Reporter, dateTime, id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Update account '${id}' successfully.`);

            //$('#page-detail #frm-update').trigger('reset');

            $.mobile.navigate('#page-list', { transition: 'none' });
        }
    });
}

// Delete Account.
$(document).on('submit', '#page-detail #frm-delete', deleteEstate);
$(document).on('keyup', '#page-detail #frm-delete #txt-delete', confirmDeleteEstate);

function confirmDeleteEstate() {
    var text = $('#page-detail #frm-delete #txt-delete').val();

    if (text == 'confirm delete') {
        $('#page-detail #frm-delete #btn-delete').removeClass('ui-disabled');
    }
    else {
        $('#page-detail #frm-delete #btn-delete').addClass('ui-disabled');
    }
}

function deleteEstate(e) {
    e.preventDefault();

    var id = localStorage.getItem('currentEstateId');

    db.transaction(function (tx) {
        var query = 'DELETE FROM Estate WHERE Id = ?';
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Delete account '${id}' successfully.`);

            $('#page-detail #frm-delete').trigger('reset');

            $.mobile.navigate('#page-list', { transition: 'none' });
        }
    });
}

// Add Comment.
$(document).on('submit', '#page-detail #frm-comment', addNote);

function addNote(e) {
    e.preventDefault();

    var estateId = localStorage.getItem('currentEstateId');
    var message = $('#page-detail #frm-comment #txt-comment').val();
    var dateTime = new Date();

    db.transaction(function (tx) {
        var query = 'INSERT INTO Note (EstateId, Message, DateAdded) VALUES (?, ?, ?)';
        tx.executeSql(query, [estateId, message, dateTime], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Add new comment to account '${estateId}' successfully.`);

            $('#page-detail #frm-comment').trigger('reset');

            showComment();
        }
    });
}

// Show Comment.
function showComment() {
    var estateId = localStorage.getItem('currentEstateId');

    db.transaction(function (tx) {
        var query = 'SELECT * FROM Note WHERE EstateId = ?';
        tx.executeSql(query, [estateId], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Get list of comments successfully.`);

            // Prepare the list of comments.
            var listNote = '';
            for (let note of result.rows) {
                listNote += `<div class = 'list'>
                                    <small>${note.DateAdded}</small>
                                    <h3>${note.Message}</h3>
                                </div>`;
            }
            
            // Add list to UI.
            $('#list-comment').empty().append(listNote);

            log(`Show list of notes successfully.`);
        }
    });

  
}

function closeWindow(){
    $('#page-create #frm-confirm').popup('close');
}

function closeWindow1(){
    $('#page-detail #frm-update').popup('close');
}

$(document).on('vclick', '#btn-cordova-beep', cordovaBeep);

function cordovaBeep() {
    navigator.notification.beep(1);
}

function cordovaVibration() {
    navigator.vibrate(3000);
}

