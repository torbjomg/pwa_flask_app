function loadContentNetworkFirst(){
    loadContent()
    .then(data => {
        // load all data on user id
        setPlanList(data);
        saveContentsLocally(data)
        .then(() => {
            setLastUpdated(new Date());
            messageDataSaved();
        }).catch(err => {
            messageSaveError();
            console.warn(err);
        });
    }).catch(err => {
        // expected error if app in offline mode
        getPlansLocal()
        .then(offlineData => {
            if (!offlineData.length) {
                messageNoData();
            } else {
                messageOffline();
                // call same DOM update function with no data
                setPlanList(null);
            }
        });
    });
}

function setLastUpdated(date){
    console.log(date);
}

function messageDataSaved(){
    console.log(" -- ");
}

function messageSaveError(){
    console.warn("err");
}

function loadContent(){
    return $.ajax({
        url: "load_content/",
        method: "GET",
    });
}

function saveContentsLocally(data){
    // data : {"plans": [...], "tasks": [...]}
    if (!("indexedDB" in window)) {return null;}
    return dbPromise.then(db => {
        var plans = data["plans"];
        var tasks = data["tasks"]
        const txPlans = db.transaction("plans", "readwrite");
        const storePlans = txPlans.objectStore("plans");
        const txTasks = db.transaction("tasks", "readwrite");
        const storeTasks = txTasks.objectStore("tasks");

        return Promise.all(plans.map(plan => storePlans.put(plan)) + 
                           tasks.map(task => storeTasks.put(task)))
        .catch(() => {
            // TODO maybe split these up incase somehow only 1 fails
            txPlans.abort();
            txTasks.abort();
            throw Error("Content was not added to the store");
        });
    });
}

function loadPlans(){
    $.ajax({
        url: "load_plans/",
        method: "POST",
        dataType: "json",
        data: JSON.stringify({    
        }),
        contentType: "application/json; charset=UTF-8",
    }).done(setPlanList).fail(function(){alert("couldn't load plans")});
}

function setPlanList(data){
    for (let index = 0; index < data["plans"].length; index++) {
        const plan = data["plans"][index];
        createPlanDiv(plan["id"], plan["name"], plan["description"]);
    }
}

function loadPlanDetails(planId){
    $.ajax({
        url: "get_plan_details/",
        method: "POST",
        dataType: "json",
        data: JSON.stringify({
            plan_id: planId
        }),
        contentType: "application/json; charset=UTF-8",
    }).done(populatePlanDetails).fail(function(){alert("couldn't load plan details")});
}

function populatePlanDetails(data){
    var spinner = document.getElementById("tempSpinner");
    if (!(spinner===null)){
        spinner.parentNode.removeChild(spinner);
    }
    // get the div to populate
    var planDiv = document.getElementById("planDiv" + String(data["planId"]));
    // temporary, just list the items
    var itemList = document.createElement("ul");
    itemList.setAttribute("class", "list-group");
    itemList.setAttribute("id", "taskList" + data["planId"]);
    for (let index = 0; index < data["tasks"].length; index++) {
        const task = data["tasks"][index];
        populateTaskItem(task["name"], task["description"], itemList, task["taskId"], data["planId"]);
    }
    planDiv.lastElementChild.appendChild(itemList);

    // reisze the active collapsible button
    var collapseContent = document.getElementById("collapsible" + data["planId"]).nextElementSibling;
    resizeCollapsible(collapseContent, itemList.scrollHeight);
}

function populateTaskItem(name, description, listElement, taskId, planId){
    var newItem = document.createElement("li");
    var editButton = document.createElement("i");
    var deleteButton = document.createElement("i");
    editButton.setAttribute("class", "fas fa-pencil-alt");
    editButton.setAttribute("onclick", "");
    deleteButton.setAttribute("class", "fas fa-trash-alt");
    deleteButton.setAttribute("onclick", "deleteTaskItem(" + String(taskId) + ", " + String(planId) + ")");
    editButton.setAttribute("style", "float:right; color:orange; margin:5px;")
    deleteButton.setAttribute("style", "float:right; color:red; margin:5px;")
    
    newItem.setAttribute("class", "list-group-item");
    newItem.innerHTML = "<strong>" + name + "</strong>: " + description;
    listElement.appendChild(newItem);
    newItem.insertAdjacentElement("beforeend", deleteButton);
    newItem.insertAdjacentElement("beforeend", editButton);
    return newItem;
}

function deleteTaskItem(taskId, planId){
    openDeleteModal(taskId, planId);
    console.log("TODO: delete task " + String(taskId) + " from plan " + String(planId));
}

function deleteTaskFromDb(taskId, planId){
    $.ajax({
        url: "delete_task/",
        method: "POST",
        dataType: "json",
        data: JSON.stringify({    
            taskId: taskId,
            planId: planId,
        }),
        contentType: "application/json; charset=UTF-8",
    }).done(deleteTaskSuccess).fail(function(){alert("couldn't delete task")});
}

function deleteTaskSuccess(data){
    // TODO remove from DOM 
    console.log(data);
    closeDeleteModal();
}

function resizeCollapsible(coll, addHeight){
    // first resize the content
    coll.style.maxHeight = String(coll.scrollHeight) + "px";
    // then resize the outer container
    allPlansDiv = document.getElementById("allPlansDiv");
    allPlansDiv.style.maxHeight = String(allPlansDiv.scrollHeight + addHeight) + "px";
}


function populateTaskModal(addItemButtonContainer, planId){
    var anchorButton = document.createElement("a");
    anchorButton.setAttribute("class", "btn btn-outline-primary");
    anchorButton.setAttribute("onclick", "addTask(" + String(planId) + ")");
    anchorButton.innerHTML = "Create New Task";
    addItemButtonContainer.appendChild(anchorButton);
}   

function populatePlanModal(addItemButtonContainer){
    // create button, add it to modal and connect to addPlan ajax call
    var anchorButton = document.createElement("a");
    anchorButton.setAttribute("class", "btn btn-outline-primary");
    anchorButton.setAttribute("onclick", "addPlan()");
    anchorButton.innerHTML = "Create New Plan";
    addItemButtonContainer.appendChild(anchorButton);
}

function deletePlan(planId){
    $.ajax({
        url: "delete_plan/",
        method: "POST",
        dataType: "json",
        data: JSON.stringify({
            planId: planId,
        }),
        contentType: "application/json; charset=UTF-8",
    }).done(deletePlanSuccess).fail(function(){alert("delete failed for some reason")});
}

function deletePlanSuccess(data){
    // called as long as the ajax call successfully, check data.result if deletion from db was successful
    if (data.result===true){
        document.getElementById("planDiv"+data.planId).remove();
    } else {
        alert("delete failed");
    }
}

function addPlan(){
    name = document.getElementById("nameInput").value;
    description = document.getElementById("descriptionInput").value;
    modalContent = document.getElementById("addItemModalContent");
    modalContent.classList.add("modal-loading");
    $.ajax({
        url: "add_plan/",
        method: "POST",
        dataType: "json",
        data: JSON.stringify({
            name: name,
            description: description,
        }),
        contentType: "application/json; charset=UTF-8",
    }).done(addPlanSuccess).fail(function(){alert("add failed for some reason")});
}

function addPlanSuccess(data){
    if (data.success===true){
        closeModal();
        createPlanDiv(data.planId, data.name, data.description);
    }
}

function addTask(planId){
    name = document.getElementById("nameInput").value;
    description = document.getElementById("descriptionInput").value;
    modalContent = document.getElementById("addItemModalContent");
    modalContent.classList.add("modal-loading");
    $.ajax({
        url: "add_task/",
        method: "POST",
        dataType: "json",
        data: JSON.stringify({
            name: name,
            description: description,
            plan_id: planId,
        }),
        contentType: "application/json; charset=UTF-8",
    }).done(addTaskSuccess).fail(function(){alert("add failed for some reason")});
}

function addTaskSuccess(data){
    if (data.success===true){
        closeModal();
        var taskList = document.getElementById("taskList" + String(data["planId"]));
        newListItem = populateTaskItem(data["name"], data["description"], taskList, data["taskId"], data["planId"]);
        var collapsibleContent = document.getElementById("collapsible" + data["planId"]).nextElementSibling;
        resizeCollapsible(collapsibleContent, newListItem.scrollHeight);
    }
}

function createPlanDiv(planId, name, description){
    // create DOM elements for a plan
    // used in member_page when initially populating the page and on successful plan add
    var divElement = document.createElement("div");
    divElement.setAttribute("id", "planDiv" + String(planId));

    // create the collapsible button
    var collapseBtn = document.createElement("div");
    collapseBtn.setAttribute("id", "collapsible" + String(planId));
    collapseBtn.setAttribute("class", "collapsible row");
    // collapseBtn.innerHTML = name;

    // create buttons inside collapsible, format text
    var textDiv = document.createElement("div");
    var buttonsDiv = document.createElement("div");
    textDiv.setAttribute("class", "col-sm-6");
    textDiv.innerHTML = name;
    buttonsDiv.setAttribute("class", "col-sm-6");
    buttonsDiv.setAttribute("style", "float:right");
    // this is the worst, TODO: fix
    buttonsDiv.innerHTML = "<a onclick='newTask("+ planId +")' class='btn btn-success' data-toggle='modal'><i class='fas fa-plus-circle'></i> <span>Add Task</span></a><a onclick='openDeletePlanModal(" + planId + ")' class='btn btn-danger' data-toggle='modal'><i class='fas fa-trash'></i> <span>Delete</span></a>";
    collapseBtn.appendChild(textDiv);
    collapseBtn.appendChild(buttonsDiv);
    
    // create the content div
    var divContent = document.createElement("div");
    divContent.setAttribute("class", "content col-lg-12");

    // create the inner paragraph
    var innerPara = document.createElement("p");
    innerPara.innerHTML = 'Description: ' + description;
    innerPara.setAttribute("class", "col-lg-12");
    // finally nest all the elements together and add to DOM
    divContent.appendChild(innerPara);
    // collapseBtn and divContent siblings inside divElement
    divElement.appendChild(collapseBtn);
    divElement.appendChild(divContent);
    
    // TODO handle case where children == 0 or 1
    allPlansDiv = document.getElementById("allPlansDiv");
    allPlansDiv.appendChild(divElement);
    // initialize the collapsible logic !! has to be done after it's added to DOM due to sibling access !! 
    initSingleCollapsible(collapseBtn);
    // resize to fit new content
    allPlansDiv.style.maxHeight = String(allPlansDiv.scrollHeight) + "px";
}
function newTask(planId){
    // make sure event of containing div click isn't triggered
    event.stopPropagation();
    openNewTaskModal(planId);
}
function openDeletePlanModal(planId){
    // make sure event of containing div click isn't triggered
    event.stopPropagation();
    
    deletePlan(planId);
}

initCollapsibles();
loadedPlans = [];
function initSingleCollapsible(ele) {
    ele.addEventListener("click", function(){
        // load plan details, make sure this only happens on the first click
        event.preventDefault();
        var content = this.nextElementSibling;
        this.classList.toggle("active");
        planId = this.id.replace( /^\D+/g, '');
        if (!(loadedPlans.includes(planId))){
            loadedPlans.push(planId);
            var planDiv = document.getElementById("planDiv" + String(planId));
            var tempImg = document.createElement("i");
            tempImg.setAttribute("class", "fas fa-sync-alt icon-4x fa-spin");
            tempImg.setAttribute("id", "tempSpinner");
            planDiv.firstElementChild.insertAdjacentElement("beforeend", tempImg)
            // planDiv.lastElementChild.appendChild(tempImg);
            loadPlanDetails(planId);
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
