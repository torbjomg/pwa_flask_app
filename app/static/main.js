function loadPrograms(){
    $.ajax({
        url: "load_programs/",
        method: "POST",
        dataType: "json",
        data: JSON.stringify({    
        }),
        contentType: "application/json; charset=UTF-8",
    }).done(setProgramList).fail(function(){alert("couldn't load programs")});
}

function setProgramList(data){
    for (let index = 0; index < data["programs"].length; index++) {
        const program = data["programs"][index];
        createProgramDiv(program["programId"], program["name"], program["description"]);
    }
}

function loadProgramDetails(programId){

    $.ajax({
        url: "get_program_details/",
        method: "POST",
        dataType: "json",
        data: JSON.stringify({
            program_id: programId
        }),
        contentType: "application/json; charset=UTF-8",
    }).done(populateProgramDetails).fail(function(){alert("couldn't load program details")});
}

function populateProgramDetails(data){
    var spinner = document.getElementById("tempSpinner");
    if (!(spinner===null)){
        spinner.parentNode.removeChild(spinner);
    }
    // get the div to populate
    var programDiv = document.getElementById("programDiv" + String(data["program_id"]));
    // temporary, just list the items
    var itemList = document.createElement("ul");
    for (let index = 0; index < data["workouts"].length; index++) {
        const workout = data["workouts"][index];
        var item = document.createElement("li");
        item.innerHTML = workout["name"] + ": " + workout["description"];
        itemList.appendChild(item);
    }

    itemList.setAttribute("id", "workoutList" + data["program_id"]);
    programDiv.lastElementChild.appendChild(itemList);

    // add button to add workout
    var btn = document.createElement("a");
    if (data["workouts"].length === 0){    
        btn.innerHTML = 'There\'s nothing here, <button class="btn btn-success" onclick=openNewWorkoutModal(' + data["program_id"] + ') style="float:right;">Add a workout!</button>';
    } else {
        btn.innerHTML = '<button class="btn btn-success" onclick=openNewWorkoutModal(' + data["program_id"] + ') style="float:right;">Add another workout!</button>';
    }
    itemList.appendChild(btn);
    // reisze the active collapsible button
    
    var collapseContent = document.getElementById("collapsible" + data["program_id"]).nextElementSibling;
    resizeCollapsible(collapseContent, itemList.scrollHeight + btn.scrollHeight);
    //collapseContent.style.maxHeight = String(collapseContent.scrollHeight) + "px";
    // finally resize the whole collapsible list
    // allProgramsDiv = document.getElementById("allProgramsDiv");
    // allProgramsDiv.style.maxHeight = String(allProgramsDiv.scrollHeight + itemList.scrollHeight + btn.scrollHeight) + "px";
}

function resizeCollapsible(coll, addHeight){
    // first resize the content
    coll.style.maxHeight = String(coll.scrollHeight) + "px";
    // then resize the outer container
    allProgramsDiv = document.getElementById("allProgramsDiv");
    allProgramsDiv.style.maxHeight = String(allProgramsDiv.scrollHeight + addHeight) + "px";
}


function populateWorkoutModal(addItemButtonContainer, programId){
    var anchorButton = document.createElement("a");
    anchorButton.setAttribute("class", "btn btn-outline-primary");
    anchorButton.setAttribute("onclick", "addWorkout(" + String(programId) + ")");
    anchorButton.innerHTML = "Create New Workout";
    addItemButtonContainer.appendChild(anchorButton);
}   

function populateProgramModal(addItemButtonContainer){
    // create button, add it to modal and connect to addProgram ajax call
    var anchorButton = document.createElement("a");
    anchorButton.setAttribute("class", "btn btn-outline-primary");
    anchorButton.setAttribute("onclick", "addProgram()");
    anchorButton.innerHTML = "Create New Program";
    addItemButtonContainer.appendChild(anchorButton);
}

function deleteProgram(programId){
    $.ajax({
        url: "delete_program/",
        method: "POST",
        dataType: "json",
        data: JSON.stringify({
            programId: programId,
        }),
        contentType: "application/json; charset=UTF-8",
    }).done(deleteProgramSuccess).fail(function(){alert("delete failed for some reason")});
}

function deleteProgramSuccess(data){
    // called as long as the ajax call successfully, check data.result if deletion from db was successful
    if (data.result===true){
        document.getElementById("programDiv"+data.programId).remove();
    } else {
        alert("delete failed");
    }
}

function addProgram(){
    name = document.getElementById("nameInput").value;
    description = document.getElementById("descriptionInput").value;
    modalContent = document.getElementsByClassName("modal-content")[0];
    modalContent.classList.add("modal-loading");
    $.ajax({
        url: "add_program/",
        method: "POST",
        dataType: "json",
        data: JSON.stringify({
            name: name,
            description: description,
        }),
        contentType: "application/json; charset=UTF-8",
    }).done(addProgramSuccess).fail(function(){alert("add failed for some reason")});
}

function addProgramSuccess(data){
    if (data.success===true){
        closeModal();
        createProgramDiv(data.programId, data.name, data.description);
    }
}

function addWorkout(programId){
    name = document.getElementById("nameInput").value;
    description = document.getElementById("descriptionInput").value;
    modalContent = document.getElementsByClassName("modal-content")[0];
    modalContent.classList.add("modal-loading");
    $.ajax({
        url: "add_workout/",
        method: "POST",
        dataType: "json",
        data: JSON.stringify({
            name: name,
            description: description,
            program_id: programId,
        }),
        contentType: "application/json; charset=UTF-8",
    }).done(addWorkoutSuccess).fail(function(){alert("add failed for some reason")});
}

function addWorkoutSuccess(data){
    if (data.success===true){
        closeModal();
        var workoutList = document.getElementById("workoutList" + String(data["programId"]));
        var newListItem = document.createElement("li");
        newListItem.innerHTML = data["name"] + ": " + data["description"];
        workoutList.appendChild(newListItem);
        var collapsibleContent = document.getElementById("collapsible" + data["programId"]).nextElementSibling;
        resizeCollapsible(collapsibleContent, newListItem.scrollHeight);
        console.log(data);
        // TODO update DOM
    }
}
function createProgramDiv(programId, name, description){
    // create DOM elements for a program
    // used in member_page when initially populating the page and on successful program add
    var divElement = document.createElement("div");
    divElement.setAttribute("id", "programDiv" + String(programId));

    // create the collapsible button
    var collapseBtn = document.createElement("button");
    collapseBtn.setAttribute("id", "collapsible" + String(programId));
    collapseBtn.setAttribute("class", "collapsible col-lg-6");
    collapseBtn.innerHTML = name;

    // create the content div
    var divContent = document.createElement("div");
    divContent.setAttribute("class", "content col-lg-6");

    // create the inner paragraph
    var innerPara = document.createElement("p");
    // this is the worst, TODO: fix
    innerPara.innerHTML = 'Description: ' + description + ' <button class="btn btn-danger" onclick=deleteProgram(' + String(programId) + ') style="float:right;">Delete Program</button>'
    
    // finally nest all the elements together and add to DOM
    divContent.appendChild(innerPara);
    // collapseBtn and divContent siblings inside divElement
    divElement.appendChild(collapseBtn);
    divElement.appendChild(divContent);
    
    // TODO handle case where children == 0 or 1
    allProgramsDiv = document.getElementById("allProgramsDiv");
    allProgramsDiv.appendChild(divElement);
    // initialize the collapsible logic !! has to be done after it's added to DOM due to sibling access !! 
    initSingleCollapsible(collapseBtn);
    // resize to fit new content
    allProgramsDiv.style.maxHeight = String(allProgramsDiv.scrollHeight) + "px";
}

initCollapsibles();
loadedPrograms = [];
function initSingleCollapsible(ele) {
    ele.addEventListener("click", function(){
        // load program details, make sure this only happens on the first click
        event.preventDefault();
        var content = this.nextElementSibling;
        this.classList.toggle("active");
        programId = this.id.replace( /^\D+/g, '');
        if (!(loadedPrograms.includes(programId))){
            loadedPrograms.push(programId);
            var programDiv = document.getElementById("programDiv" + String(programId));
            var tempImg = document.createElement("i");
            tempImg.setAttribute("class", "fas fa-sync-alt icon-4x fa-spin");
            tempImg.setAttribute("id", "tempSpinner");
            programDiv.firstElementChild.insertAdjacentElement("beforeend", tempImg)
            // programDiv.lastElementChild.appendChild(tempImg);
            loadProgramDetails(programId);
        }
        
        if (content.style.maxHeight){
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
        }
    });
}
function initCollapsibles() {
    var coll = document.getElementsByClassName("collapsible");
    var i;
    for (i = 0; i < coll.length; i++) {
        initSingleCollapsible(coll[i]);
    }
}
