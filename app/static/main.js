function deleteProgram(programId){
    $.ajax({
        url: "/delete_program/",
        method: "DELETE",
        dataType: "json",
        data: JSON.stringify({
            programId: programId,
        }),
        contentType: "application/json; charset=UTF-8",
    }).done(deleteTaskSuccess).fail(function(){alert("delete failed for some reason")});
}

function addProgram(){
    name = document.getElementById("programNameInput").value;
    description = document.getElementById("programDescriptionInput").value;
    modalContent = document.getElementsByClassName("modal-content")[0];
    modalContent.classList.add("modal-loading");
    $.ajax({
        url: "/add_program",
        method: "PUT",
        dataType: "json",
        data: JSON.stringify({
            name: name,
            description: description,
        }),
        contentType: "application/json; charset=UTF-8",
    }).done(addProgramSuccess).fail(function(){alert("add failed for some reason")});
}
