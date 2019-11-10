const STATUS_OPTIONS = 4;
let applicationItems = [];

function addApplication(company, position, link, status) {
    const application = {
        company,
        position,
        link,
        status
    };

    applicationItems.push(application);

    const list = document.querySelector(".js-applications-list");
    const listItem = document.createElement("li");
    listItem.setAttribute("class", "application-item");
    const para1 = document.createElement("p");
    para1.textContent = application.company;
    listItem.appendChild(para1);
    const para2 = document.createElement("p");
    para2.textContent = application.position;
    listItem.appendChild(para2);

    switch(status){
        case "wishlist":
            listItem.style.backgroundColor = "yellow";
            break;
        case "applied":
            listItem.style.backgroundColor = "orange";
            break;
        case "phone":
            listItem.style.backgroundColor = "blue";
            break;
        case "site":
            listItem.style.backgroundColor = "green";
            break;
    }

    const div = document.createElement("div");
    div.setAttribute("class", "status-div");
    div.style.fontSize = "12px";

    const p = document.createElement("p");
    p.textContent = "Application status:";
    div.appendChild(p);

    const radioGroupName = "job-status" + applicationItems.length;
    for (let i = 0; i < STATUS_OPTIONS; i++) {
        const radioInput = document.createElement("input");
        radioInput.setAttribute("type", "radio");
        radioInput.setAttribute("name", radioGroupName);
        switch(i){
            case 0:
                radioInput.setAttribute("value", "wishlist");
                radioInput.setAttribute("id", "wishlist" + applicationItems.length);
                if (application.status === radioInput.value){
                    radioInput.checked = true;
                }
                break;
            case 1:
                radioInput.setAttribute("value", "applied");
                radioInput.setAttribute("id", "applied" + applicationItems.length);
                if (application.status === radioInput.value){
                    radioInput.checked = true;
                }
                break;
            case 2:
                radioInput.setAttribute("value", "phone");
                radioInput.setAttribute("id", "phone" + applicationItems.length);
                if (application.status === radioInput.value){
                    radioInput.checked = true;
                }
                break;
            case 3:
                radioInput.setAttribute("value", "site");
                radioInput.setAttribute("id", "site" + applicationItems.length);
                if (application.status === radioInput.value){
                    radioInput.checked = true;
                }
                break;
        }
        
        const label = document.createElement("label");
        label.setAttribute("for", radioInput.getAttribute("id"));
        label.textContent = radioInput.value[0].toUpperCase() + radioInput.value.slice(1);

        div.appendChild(radioInput);
        div.appendChild(label);
    }
    
    listItem.appendChild(div);

    list.append(listItem);
    console.log(listItem);

    const radioGroup = document.querySelectorAll(`input[type=radio][name=${radioGroupName}]`);

    Array.prototype.forEach.call(radioGroup, function(radio) {
        radio.addEventListener('change', statusChangeHandler);
     });
}

function statusChangeHandler(event) {
    const target = event.target;
    const listItem = target.parentNode.parentNode;
    console.log(listItem);
    if(target.value === "wishlist"){
        listItem.style.backgroundColor = "yellow";
    } else if(target.value === "applied"){
        listItem.style.backgroundColor = "orange";
    } else if(target.value === "phone"){
        listItem.style.backgroundColor = "blue";
    } else {
        listItem.style.backgroundColor = "green";
    }
}

const form = document.querySelector(".js-form");
form.addEventListener("submit", function(event){
    event.preventDefault();
    const companyInput = document.getElementById("company-name");
    const positionInput = document.getElementById("position-name");
    const linkInput = document.getElementById("posting-url");

    const companyText = companyInput.value.trim();
    const positionText = positionInput.value.trim();
    const linkText = linkInput.value.trim();
    const statusText = document.querySelector("input[name='job-status']:checked").value;

    if(companyText !== '' && positionText !== ''){
        addApplication(companyText, positionText, linkText, statusText);

        // reset the form
        companyInput.value = '';
        positionInput.value = '';
        linkInput.value = '';
        document.getElementById("wishlist").checked = true;
        document.getElementById("applied").checked = false;
        document.getElementById("phone").checked = false;
        document.getElementById("site").checked = false;
        companyInput.focus();
    }
});