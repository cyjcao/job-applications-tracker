const STATUS_VALUES = ['wishlist', 'applied', 'phone', 'site']; // job application status options (for radio buttons)
const NUM_STATUS_OPTIONS = STATUS_VALUES.length;
let wishlistItems = [];
let applicationItems = [];
let interviewItems = [];
let itemsCreated = 0;


// factory function that creates an application item object
// company -> company name
// position -> position title
// link -> job posting url
// status -> application status

function create_application_item(company, position, link=None, status) {
    let id = company + '-' + position + itemsCreated;
    return {company, position, link, status, id};
}

// show/hide the headers for each status list
// hide when there's 0 items for a status
function toggleHiddenListHeaders(){
    const wishlistHeader = document.getElementById('wishlist-header');
    const applicationsHeader = document.getElementById('applications-header');
    const interviewsHeader = document.getElementById('interviews-header');
    if(wishlistItems.length === 0 && !wishlistHeader.classList.contains('hidden')){
        wishlistHeader.classList.add('hidden');
    } else if(wishlistItems.length !== 0 && wishlistHeader.classList.contains('hidden')){
        wishlistHeader.classList.remove('hidden');
    }

    if(applicationItems.length === 0 && !applicationsHeader.classList.contains('hidden')){
        applicationsHeader.classList.add('hidden');
    } else if(applicationItems.length !== 0 && applicationsHeader.classList.contains('hidden')){
        applicationsHeader.classList.remove('hidden');
    }

    if(interviewItems.length === 0 && !interviewsHeader.classList.contains('hidden')){
        interviewsHeader.classList.add('hidden');
    } else if(interviewItems.length !== 0 && interviewsHeader.classList.contains('hidden')){
        interviewsHeader.classList.remove('hidden');
    }
}

function statusChangeHandler(event) {
    const target = event.target;
    const listItem = target.parentNode.parentNode.parentNode;
    const listItemId = listItem.getAttribute('id');
    console.log(listItem);
    if(target.value === "wishlist"){
        listItem.style.backgroundColor = "yellow";
    } else if(target.value === "applied"){
        listItem.style.backgroundColor = "orange";
    } else if(target.value === "phone"){
        listItem.style.backgroundColor = "#add8e6";
    } else {
        listItem.style.backgroundColor = "#009fab";
    }

    const wishlistElem = document.querySelector(".js-wishlist-list");
    const applicationlistElem = document.querySelector(".js-applications-list");
    const interviewlistElem = document.querySelector(".js-interviews-list");
    if(target.value === STATUS_VALUES[0]){
        if(!wishlistElem.contains(listItem) && applicationlistElem.contains(listItem)){
          let oldChild = applicationlistElem.removeChild(listItem);
          wishlistElem.appendChild(oldChild);

          let application = applicationItems.find(item => item.id === listItemId);
          applicationItems = applicationItems.filter(item => item.id !== listItemId);
          wishlistItems.push(application);
        } else if(!wishlistElem.contains(listItem) && interviewlistElem.contains(listItem)){
            let oldChild = interviewlistElem.removeChild(listItem);
            wishlistElem.appendChild(oldChild);
  
            let application = interviewItems.find(item => item.id === listItemId);
            interviewItems = interviewItems.filter(item => item.id !== listItemId);
            wishlistItems.push(application);
        }
    } else if(target.value === STATUS_VALUES[1]){
        if(!applicationlistElem.contains(listItem) && wishlistElem.contains(listItem)){
          let oldChild = wishlistElem.removeChild(listItem);
          applicationlistElem.appendChild(oldChild);

          let application = wishlistItems.find(item => item.id === listItemId);
          wishlistItems = wishlistItems.filter(item => item.id !== listItemId);
          applicationItems.push(application);
        } else if(!applicationlistElem.contains(listItem) && interviewlistElem.contains(listItem)){
            let oldChild = interviewlistElem.removeChild(listItem);
            applicationlistElem.appendChild(oldChild);
  
            let application = interviewItems.find(item => item.id === listItemId);
            interviewItems = interviewItems.filter(item => item.id !== listItemId);
            applicationItems.push(application);
        }
    } else{
        if(!interviewlistElem.contains(listItem) && wishlistElem.contains(listItem)){
            let oldChild = wishlistElem.removeChild(listItem);
            interviewlistElem.appendChild(oldChild);
  
            let application = wishlistItems.find(item => item.id === listItemId);
            wishlistItems = wishlistItems.filter(item => item.id !== listItemId);
            interviewItems.push(application);
        } else if(!interviewlistElem.contains(listItem) && applicationlistElem.contains(listItem)){
            let oldChild = applicationlistElem.removeChild(listItem);
            interviewlistElem.appendChild(oldChild);
  
            let application = applicationItems.find(item => item.id === listItemId);
            applicationItems = applicationItems.filter(item => item.id !== listItemId);
            interviewItems.push(application);
        }
    }

    toggleHiddenListHeaders();
}

function createStatusButtons(checked_value) {
    const div = document.createElement('div');
    div.setAttribute('class', 'status-div');
    const p = document.createElement('p');
    p.textContent = 'Application Status:';
    div.appendChild(p);
    let radioArr = [];
    for(let i = 0; i < NUM_STATUS_OPTIONS; i++){
        const radioBtn = document.createElement('input');
        radioBtn.setAttribute('type', 'radio');
        radioBtn.setAttribute('name', 'status' + itemsCreated);
        radioBtn.setAttribute('value', STATUS_VALUES[i]);
        radioBtn.setAttribute('cursor', 'pointer');
        if(radioBtn.getAttribute('value') === checked_value){
            radioBtn.setAttribute('checked', true);
        }

        const label = document.createElement('label');
        label.textContent = STATUS_VALUES[i][0].toUpperCase() + STATUS_VALUES[i].slice(1);
        label.appendChild(radioBtn);
        div.appendChild(label);

        radioBtn.addEventListener('change', statusChangeHandler);
    }

    return div;
}

function addApplicationItem(company, position, link, status) {
    const application = create_application_item(company, position, link, status);
    let list;
    if(application.status === STATUS_VALUES[0]){
        wishlistItems.push(application);
        list = document.querySelector(".js-wishlist-list");
    } else if(application.status === STATUS_VALUES[1]) {
        applicationItems.push(application);
        list = document.querySelector(".js-applications-list");
    } else{
        interviewItems.push(application);
        list = document.querySelector(".js-interviews-list");
    }

    const listItem = document.createElement("li");
    listItem.setAttribute("id", application.id);
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
            listItem.style.backgroundColor = "#add8e6";
            break;
        case "site":
            listItem.style.backgroundColor = "#009fab";
            break;
    }
    
    const statusBtnDiv = createStatusButtons(application.status);
    listItem.appendChild(statusBtnDiv);

    list.append(listItem);

    toggleHiddenListHeaders();
    itemsCreated += 1;
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
        addApplicationItem(companyText, positionText, linkText, statusText);

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