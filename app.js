
// job application status options (for radio buttons)
const STATUS_VALUES = ['wishlist', 'applied', 'phone', 'site']; 
const NUM_STATUS_OPTIONS = STATUS_VALUES.length;
const STATUS_COLORS = {
    [STATUS_VALUES[0]]: 'yellow',
    [STATUS_VALUES[1]]: 'orange',
    [STATUS_VALUES[2]]: '#add8e6',
    [STATUS_VALUES[3]]: '#009fab'
};


const wishlistElem = document.querySelector(".js-wishlist-list");
const applicationlistElem = document.querySelector(".js-applications-list");
const interviewlistElem = document.querySelector(".js-interviews-list");

let itemsCreated = 0;

// indexeddb constants
const DB_NAME = 'jobApplications';
const DB_VER = 1;
const DB_STORE_NAME = 'applicationList';
// db object instance to store date in
let db; 

// factory function that creates an application item object
// company -> company name
// position -> position title
// link -> job posting url
// status -> application status

function create_application_item(company, position, link=None, status) {
    let id = Date.now()
    let datetimeInfo = {
        applicationDeadline: undefined,
        appliedTime: undefined,
        interviewTime: undefined
    };
    return {id, company, position, link, status, datetimeInfo};
}

// show/hide the headers for each status list
// hide when there's 0 items for a status
function toggleHiddenListHeaders(){
    const wishlistHeader = document.getElementById('wishlist-header');
    const applicationsHeader = document.getElementById('applications-header');
    const interviewsHeader = document.getElementById('interviews-header');
    if(!wishlistElem.hasChildNodes() && !wishlistHeader.classList.contains('hidden')){
        wishlistHeader.classList.add('hidden');
    } else if(wishlistElem.hasChildNodes() && wishlistHeader.classList.contains('hidden')){
        wishlistHeader.classList.remove('hidden');
    }

    if(!applicationlistElem.hasChildNodes() && !applicationsHeader.classList.contains('hidden')){
        applicationsHeader.classList.add('hidden');
    } else if(applicationlistElem.hasChildNodes() && applicationsHeader.classList.contains('hidden')){
        applicationsHeader.classList.remove('hidden');
    }

    if(!interviewlistElem.hasChildNodes() && !interviewsHeader.classList.contains('hidden')){
        interviewsHeader.classList.add('hidden');
    } else if(interviewlistElem.hasChildNodes() && interviewsHeader.classList.contains('hidden')){
        interviewsHeader.classList.remove('hidden');
    }
}

window.onload = function() {

    // In the following line, you should include the prefixes of implementations you want to test.
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    // DON'T use "var indexedDB = ..." if you're not in a function.
    // Moreover, you may need references to some window.IDB* objects:
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
    // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)

    let DBOpenRequest = window.indexedDB.open(DB_NAME, DB_VER);

    // success and error handlers for loading database
    DBOpenRequest.onerror = function(event) {
        console.log("Error loading database");
    };

    DBOpenRequest.onsuccess = function(event) {
        db = DBOpenRequest.result;
        // to do: display data
        console.log("sucess load db");
        displayData();
    };

    // event handler for when a new version of database needs to be created
    // either one doesn't exist or a new version number has been submitted
    DBOpenRequest.onupgradeneeded = function(event) {
        let db = event.target.result;

        db.onerror = function(event) {
            console.log("Error loading database");
        };

        let objectStore = db.createObjectStore(DB_STORE_NAME, { keyPath: 'id' });

        // defined indexes to enable searches by other object keys
        objectStore.createIndex("companyName", "company");
        objectStore.createIndex("status", "status");
    };

    const form = document.querySelector(".js-form");
    const formContainerDiv = document.querySelector('.form-container');
    const dateTimeDiv = addDateTimePickers();
    
    formContainerDiv.insertBefore(dateTimeDiv, document.querySelector('.form-container button'));

    form.addEventListener("submit", function(event){
        event.preventDefault();
        const companyInput = document.getElementById("company-name");
        const positionInput = document.getElementById("position-name");
        const linkInput = document.getElementById("posting-url");

        const companyText = companyInput.value.trim();
        const positionText = positionInput.value.trim();
        const linkText = linkInput.value.trim();
        const statusValue = document.querySelector("input[name='job-status']:checked").value;

        const datetimeLabel = dateTimeDiv.children[0];
        const datePicker = dateTimeDiv.children[1];
        const dateFromPicker = datePicker.value;
        const timePicker = dateTimeDiv.children[2];
        const timeFromPicker = timePicker.value;

        if(companyText !== '' && positionText !== ''){
            const application = create_application_item(companyText, positionText, linkText, statusValue);
    
            // extract user entered date and time info to create new Date object
            let dateParts;
            let timeParts;
            if(dateFromPicker){
                dateParts = dateFromPicker.split('-');
            }
            if(timeFromPicker){
                timeParts = timeFromPicker.split(':');
            }
        
            // store date and time info based on which status job application is currently at
            if(application.status === STATUS_VALUES[0]){
                application.datetimeInfo.applicationDeadline = new Date(dateParts[0], dateParts[1]-1, dateParts[2]).toISOString(); 
            } else if(application.status === STATUS_VALUES[1]){
                application.datetimeInfo.appliedTime = new Date(dateParts[0], dateParts[1]-1, dateParts[2]).toISOString();
            } else {
                application.datetimeInfo.interviewTime = new Date(dateParts[0], dateParts[1]-1, dateParts[2], timeParts[0], timeParts[1]).toISOString();
            }
        
            // open a read/write transaction to add data to database
            let transaction = db.transaction([DB_STORE_NAME], "readwrite");
        
            transaction.oncomplete = function() {
                // to do: display data
                console.log("Add successful")
                displayData();
                console.log("add display end");
            };
        
            transaction.onerror = function() {
                console.log('Transaction not opened due to error: ' + transaction.error);
            };
        
            let objectStore = transaction.objectStore(DB_STORE_NAME, 'readwrite');
        
            let objectStoreAddRequest = objectStore.add(application);
            objectStoreAddRequest.onsuccess = function(event) {
                // reset the form
                companyInput.value = '';
                positionInput.value = '';
                linkInput.value = '';
                document.getElementById("wishlist").checked = true;
                document.getElementById("applied").checked = false;
                document.getElementById("phone").checked = false;
                document.getElementById("site").checked = false;
                datetimeLabel.textContent = 'When is the deadline to apply?';
                datePicker.value = '';
                timePicker.hidden = true;
                
                companyInput.focus();
            };    
        }
    });

    const formStatusRadioBtns = document.querySelectorAll('input[name=job-status]');
    formStatusRadioBtns.forEach(function(btn){
        btn.addEventListener('change', changeDateTimeOptions);
    });

    function findTimeDifference(date, unit='seconds'){
        let now = new Date();
        let dateTimeStamp = (new Date(date)).getTime();
        let nowTimeStamp = now.getTime();
    
        let microSecondsDiff = Math.abs(dateTimeStamp - nowTimeStamp);
        let difference = microSecondsDiff / 1000;
        if(unit.toLowerCase() === 'days'){
            difference = Math.floor(microSecondsDiff/(1000 * 60 * 60 * 24));
        } else if(unit.toLowerCase() === 'hours'){
            difference = Math.floor(microSecondsDiff/(1000 * 60 * 60));
        }
    
        return difference;
    }
    
    function changeDateTimeOptions(event) {
        const target = event.target;
        let parentDiv = target.parentNode.parentNode.parentNode;
        if(parentDiv.nodeName.toLowerCase() !== "div"){
            parentDiv = target.parentNode.parentNode;
        }
        const datetimeDiv = Array.from(parentDiv.children).filter(child => child.classList.contains('datetime-div'))[0];
        console.log(datetimeDiv);
        datetimeDiv.hidden = false;
        const formDateTimeLabel = Array.from(datetimeDiv.children).filter(child => child.nodeName.toLowerCase() === 'p')[0];
        const datePicker = datetimeDiv.children[1];
        const timePicker = datetimeDiv.children[2];
    
        let today = new Date();
        let dd = today.getDate();
        let mm = today.getMonth() + 1;
        let yyyy = today.getFullYear();
        if(dd < 10){
            dd = '0' + dd;
        }
        if(mm < 10){
            mm = '0' + mm;
        }
        today = yyyy + '-' + mm + '-' + dd;
        
        if(target.value === STATUS_VALUES[0]){
            formDateTimeLabel.textContent = 'When is the deadline to apply?';
            datePicker.removeAttribute('max');
            datePicker.setAttribute('min', today)
            timePicker.hidden = true;
        } else if(target.value === STATUS_VALUES[1]){
            formDateTimeLabel.textContent = 'When did you apply?';
            datePicker.removeAttribute('min');
            datePicker.setAttribute('max', today)
            timePicker.hidden = true;
        } else {
            formDateTimeLabel.textContent = 'When is your interview?';
            datePicker.removeAttribute('max');
            datePicker.setAttribute('min', today)
            timePicker.hidden = false;
        }
    
    }
    
    function addDateTimePickers() {
        const formDateTimeDiv = document.createElement('div');
        formDateTimeDiv.setAttribute('class', 'datetime-div');
        const formDateTimeLabel = document.createElement('p');
        formDateTimeLabel.textContent = 'When is the deadline to apply?';
        const datePicker = document.createElement('input');
        datePicker.setAttribute('type', 'date');
        let today = new Date();
        let dd = today.getDate();
        let mm = today.getMonth() + 1;
        let yyyy = today.getFullYear();
        if(dd < 10){
            dd = '0' + dd;
        }
        if(mm < 10){
            mm = '0' + mm;
        }
        today = yyyy + '-' + mm + '-' + dd;
        datePicker.setAttribute('min', today);
        const timePicker = document.createElement('input');
        timePicker.setAttribute('type', 'time');
        timePicker.setAttribute('min', '00:00');
        timePicker.setAttribute('max', '23:59');
        timePicker.hidden = true;
    
        formDateTimeDiv.appendChild(formDateTimeLabel);
        formDateTimeDiv.appendChild(datePicker);
        formDateTimeDiv.appendChild(timePicker);
    
        return formDateTimeDiv;
    }
    
    function createStatusButtons(application) {
        const form = document.createElement('form');
        const div = document.createElement('div');
        div.setAttribute('class', 'status-div');
        const p = document.createElement('p');
        p.textContent = 'Application Status:';
        div.appendChild(p);
    
        for(let i = 0; i < NUM_STATUS_OPTIONS; i++){
            const radioBtn = document.createElement('input');
            radioBtn.setAttribute('type', 'radio');
            radioBtn.setAttribute('name', 'status' + application.id);
            radioBtn.setAttribute('value', STATUS_VALUES[i]);
            radioBtn.setAttribute('cursor', 'pointer');
            radioBtn.setAttribute('disabled', true);
            if(radioBtn.getAttribute('value') === application.status){
                radioBtn.setAttribute('checked', true);
            }
    
            const label = document.createElement('label');
            label.textContent = STATUS_VALUES[i][0].toUpperCase() + STATUS_VALUES[i].slice(1);
            label.appendChild(radioBtn);
            div.appendChild(label);
    
            // radioBtn.addEventListener('change', statusChangeHandler);
            radioBtn.addEventListener('change', function(radioBtn){
                // const listItem = document.getElementById(application.id);
                changeDateTimeOptions(radioBtn);
            });
        }
    
        const dateTimeDiv = addDateTimePickers();
        dateTimeDiv.hidden = true;
        div.appendChild(dateTimeDiv);
    
        const submitBtn = document.createElement('button');
        submitBtn.setAttribute('type', 'submit');
        submitBtn.textContent = 'Submit';
        submitBtn.classList.add('hidden');
        
        div.appendChild(document.createElement("br"));
        div.appendChild(submitBtn);
    
        form.appendChild(div);
    
        // update IndexedDB when form is submitted and update the page
        form.addEventListener("submit", function (event) {
            event.preventDefault();
    
            const newStatusValue = document.querySelector("input[name=status" + application.id + "]:checked").value;
    
            const dateTimeDiv = Array.from(event.target.children[0].children).filter(child => child.classList.contains('datetime-div'))[0];
            const datePicker = dateTimeDiv.children[1];
            const dateFromPicker = datePicker.value;
            const timePicker = dateTimeDiv.children[2];
            const timeFromPicker = timePicker.value;
    
            // extract user entered date and time info to create new Date object
            let dateParts;
            let timeParts;
            if (dateFromPicker) {
                dateParts = dateFromPicker.split('-');
            }
            if (timeFromPicker) {
                timeParts = timeFromPicker.split(':');
            }
            
            let objectStore = db.transaction([DB_STORE_NAME], "readwrite").objectStore(DB_STORE_NAME);
            let getItemRequest = objectStore.get(application.id);
    
            getItemRequest.onerror = function(event) {
                console.log("Failed to retrieve item from DB");
            };
    
            getItemRequest.onsuccess = function (event) {
                // value that we want to update
                let data = event.target.result;
    
                data.status = newStatusValue;
                // store date and time info based on which status job application is currently at
                if (data.status === STATUS_VALUES[0]) {
                    data.datetimeInfo.applicationDeadline = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]).toISOString();
                } else if (data.status === STATUS_VALUES[1]) {
                    data.datetimeInfo.appliedTime = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]).toISOString();
                } else {
                    data.datetimeInfo.interviewTime = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1]).toISOString();
                }
    
                let requestUpdate = objectStore.put(data);
    
                requestUpdate.onerror = function(event) {
                    console.log("Error putting updated object back into database");
                };
    
                requestUpdate.onsuccess = function(event){
                    displayData();
                };
    
            };
        });
    
        return form;
    }

    function displayData() {    
        // status lists to store the job application items
        let wishlistItems = [];
        let applicationItems = [];
        let interviewItems = [];
    
        // store application items into different arrays based on status
        let transaction = db.transaction([DB_STORE_NAME]);
        let objectStore = transaction.objectStore(DB_STORE_NAME);
        let statusIndex = objectStore.index('status');
        let wishlistKeyRange = IDBKeyRange.only(STATUS_VALUES[0]);
        let applicationKeyRange = IDBKeyRange.only(STATUS_VALUES[1]);
        let interviewKeyRange = IDBKeyRange.bound(STATUS_VALUES[2], STATUS_VALUES[3]);
        statusIndex.openCursor(wishlistKeyRange).onsuccess = function (event) {
            // clear list contents so don't display list of duplicates
            wishlistElem.innerHTML = '';

            let cursor = event.target.result;
            if (cursor) {
                wishlistItems.push(cursor.value);
                cursor.continue();
            }

            wishlistItems.sort(function (a, b){
                return (new Date(a.datetimeInfo.applicationDeadline)).getTime() - (new Date(b.datetimeInfo.applicationDeadline)).getTime();
            });

            for (let i = 0; i < wishlistItems.length; i++) {
                const listItem = document.createElement("li");
                listItem.setAttribute("id", wishlistItems[i].id);
                listItem.classList.add('grid-container');
                listItem.classList.add('application-item');
                listItem.style.backgroundColor = STATUS_COLORS[STATUS_VALUES[0]];

                const editButtonsDiv = document.createElement("div");
                editButtonsDiv.setAttribute("justify-self", "end");
                editButtonsDiv.classList.add('application-item-buttons');
                const editButton = document.createElement("button");
                editButton.innerHTML = '<i class="fas fa-edit"></i>';
                const delButton = document.createElement("button");
                delButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
                delButton.setAttribute('padding-left', '5px');
                editButtonsDiv.appendChild(editButton)
                editButtonsDiv.appendChild(delButton);
                listItem.appendChild(editButtonsDiv);

                const para1 = document.createElement("p");
                para1.textContent = wishlistItems[i].company;
                listItem.appendChild(para1);

                if(wishlistItems[i].link){
                    const a = document.createElement("a");
                    a.setAttribute("href", wishlistItems[i].link);
                    const para2 = document.createElement("p");
                    para2.textContent = wishlistItems[i].position;
                    a.appendChild(para2);
                    listItem.appendChild(a);
                } else {
                    const para2 = document.createElement("p");
                    para2.textContent = wishlistItems[i].position;
                    listItem.appendChild(para2);
                }
        
                const timeInfoDiv = document.createElement('div');
                timeInfoDiv.setAttribute('class', 'timeinfo-div');
        
                const timeInfoPara = document.createElement('p');
                timeInfoDiv.appendChild(timeInfoPara);
                if((new Date(wishlistItems[i].datetimeInfo.applicationDeadline)).getTime() < (new Date()).getTime()){
                    timeInfoPara.textContent = 'Deadline to apply has passed!';
                } else{
                    timeInfoPara.textContent = findTimeDifference(wishlistItems[i].datetimeInfo.applicationDeadline, 'days') + ' days left until deadline';
                }
        
                const statusBtnDiv = createStatusButtons(wishlistItems[i]);
                listItem.appendChild(statusBtnDiv);
            
                listItem.appendChild(timeInfoDiv);

                editButton.addEventListener('click', function(event) {
                    const div = statusBtnDiv.children[0];

                    for(let i = 1; i <= NUM_STATUS_OPTIONS; i++){
                        div.children[i].children[0].disabled = false;
                    }

                    div.children[div.children.length - 1].classList.remove("hidden");

                });

                delButton.addEventListener('click', function(event) {
                    let transaction = db.transaction([DB_STORE_NAME], "readwrite");

                    transaction.oncomplete = function(event) {
                        displayData();
                    };
                    
                    let objectStore = transaction.objectStore(DB_STORE_NAME);
                    let deleteRequest = objectStore.delete(Number(event.target.parentNode.parentNode.parentNode.id));
                    
                    deleteRequest.onerror = function(event) {
                        console.log("Error deleting item");
                    };
                });
            
                wishlistElem.append(listItem);    
            }

        };
        statusIndex.openCursor(applicationKeyRange).onsuccess = function (event) {
            applicationlistElem.innerHTML = '';
            let cursor = event.target.result;
            if (cursor) {
                applicationItems.push(cursor.value);
                cursor.continue();
            }

            applicationItems.sort(function (a, b){
                return (new Date(a.datetimeInfo.appliedTime)).getTime() - (new Date(b.datetimeInfo.appliedTime)).getTime();
            });

            for (let i = 0; i < applicationItems.length; i++) {
                const listItem = document.createElement("li");
                listItem.setAttribute("id", applicationItems[i].id);
                listItem.setAttribute("class", "application-item");
                listItem.style.backgroundColor = STATUS_COLORS[STATUS_VALUES[1]];

                const editButtonsDiv = document.createElement("div");
                editButtonsDiv.setAttribute("justify-self", "end");
                editButtonsDiv.classList.add('application-item-buttons');
                const editButton = document.createElement("button");
                editButton.innerHTML = '<i class="fas fa-edit"></i>';
                const delButton = document.createElement("button");
                delButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
                delButton.setAttribute('padding-left', '5px');
                editButtonsDiv.appendChild(editButton)
                editButtonsDiv.appendChild(delButton);
                listItem.appendChild(editButtonsDiv);

                const para1 = document.createElement("p");
                para1.textContent = applicationItems[i].company;
                listItem.appendChild(para1);
                if(applicationItems[i].link){
                    const a = document.createElement("a");
                    a.setAttribute("href", applicationItems[i].link);
                    const para2 = document.createElement("p");
                    para2.textContent = applicationItems[i].position;
                    a.appendChild(para2);
                    listItem.appendChild(a);
                } else {
                    const para2 = document.createElement("p");
                    para2.textContent = applicationItems[i].position;
                    listItem.appendChild(para2);
                }
        
                const timeInfoDiv = document.createElement('div');
                timeInfoDiv.setAttribute('class', 'timeinfo-div');
        
                const timeInfoPara = document.createElement('p');
                timeInfoDiv.appendChild(timeInfoPara);
                timeInfoPara.textContent = findTimeDifference(applicationItems[i].datetimeInfo.appliedTime, 'days') + ' days since you applied';
        
                const statusBtnDiv = createStatusButtons(applicationItems[i]);
                listItem.appendChild(statusBtnDiv);
            
                listItem.appendChild(timeInfoDiv);

                editButton.addEventListener('click', function(event) {
                    const div = statusBtnDiv.children[0];

                    for(let i = 1; i <= NUM_STATUS_OPTIONS; i++){
                        div.children[i].children[0].disabled = false;
                    }
                    console.log(div.children[div.children.length - 1]);
                    div.children[div.children.length - 1].classList.remove("hidden");
                });

                delButton.addEventListener('click', function(event) {
                    let transaction = db.transaction([DB_STORE_NAME], "readwrite");

                    transaction.oncomplete = function(event) {
                        displayData();
                    };
                    console.log(event.target.parentNode.parentNode.parentNode.id);
                    let objectStore = transaction.objectStore(DB_STORE_NAME);
                    let deleteRequest = objectStore.delete(Number(event.target.parentNode.parentNode.parentNode.id));
                    
                    deleteRequest.onerror = function(event) {
                        console.log("Error deleting item");
                    };
                });
            
                applicationlistElem.append(listItem);    
            }
        };
        statusIndex.openCursor(interviewKeyRange).onsuccess = function (event) {
            interviewlistElem.innerHTML = '';
            let cursor = event.target.result;
            if (cursor) {
                interviewItems.push(cursor.value);
                cursor.continue();
            }

            interviewItems.sort(function (a, b){
                return (new Date(a.datetimeInfo.interviewTime)).getTime() - (new Date(b.datetimeInfo.interviewTime)).getTime();
            });

            for (let i = 0; i < interviewItems.length; i++) {
                const listItem = document.createElement("li");
                listItem.setAttribute("id", interviewItems[i].id);
                listItem.setAttribute("class", "application-item");
                if(interviewItems[i].status === STATUS_VALUES[2]){
                    listItem.style.backgroundColor = STATUS_COLORS[STATUS_VALUES[2]];
                } else {
                    listItem.style.backgroundColor = STATUS_COLORS[STATUS_VALUES[3]];
                }

                const editButtonsDiv = document.createElement("div");
                editButtonsDiv.setAttribute("justify-self", "end");
                editButtonsDiv.classList.add('application-item-buttons');
                const editButton = document.createElement("button");
                editButton.innerHTML = '<i class="fas fa-edit"></i>';
                const delButton = document.createElement("button");
                delButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
                delButton.setAttribute('padding-left', '5px');
                editButtonsDiv.appendChild(editButton)
                editButtonsDiv.appendChild(delButton);
                listItem.appendChild(editButtonsDiv);

                const para1 = document.createElement("p");
                para1.textContent = interviewItems[i].company;
                listItem.appendChild(para1);
                if(interviewItems[i].link){
                    const a = document.createElement("a");
                    a.setAttribute("href", interviewItems[i].link);
                    const para2 = document.createElement("p");
                    para2.textContent = interviewItems[i].position;
                    a.appendChild(para2);
                    listItem.appendChild(a);
                } else {
                    const para2 = document.createElement("p");
                    para2.textContent = interviewItems[i].position;
                    listItem.appendChild(para2);
                }
        
                const timeInfoDiv = document.createElement('div');
                timeInfoDiv.setAttribute('class', 'timeinfo-div');
        
                const timeInfoPara = document.createElement('p');
                timeInfoDiv.appendChild(timeInfoPara);
                let secondsDiff = findTimeDifference(interviewItems[i].datetimeInfo.interviewTime);
                let daysDiff = Math.floor(secondsDiff / 86400);
                secondsDiff -= daysDiff * 86400;
                let hoursDiff = Math.floor(secondsDiff / 3600) % 24;
                timeInfoPara.textContent = daysDiff + ' days and ' + hoursDiff;
                if( (new Date(interviewItems[i].datetimeInfo.interviewTime).getTime() < (new Date()).getTime())){
                    timeInfoPara.textContent += ' hours since your interview'; 
                } else {
                    timeInfoPara.textContent += ' hours until your interview';
                }
        
                const statusBtnDiv = createStatusButtons(interviewItems[i]);
                listItem.appendChild(statusBtnDiv);
            
                listItem.appendChild(timeInfoDiv);

                editButton.addEventListener('click', function(event) {
                    const div = statusBtnDiv.children[0];

                    for(let i = 1; i <= NUM_STATUS_OPTIONS; i++){
                        div.children[i].children[0].disabled = false;
                    }

                    console.log(div.children[div.children.length - 1]);
                    div.children[div.children.length - 1].classList.remove("hidden");

                });

                delButton.addEventListener('click', function(event) {
                    let transaction = db.transaction([DB_STORE_NAME], "readwrite");

                    transaction.oncomplete = function(event) {
                        displayData();
                    };
                    console.log(event.target.parentNode.parentNode.parentNode.id);
                    let objectStore = transaction.objectStore(DB_STORE_NAME);
                    let deleteRequest = objectStore.delete(Number(event.target.parentNode.parentNode.parentNode.id));
                    
                    deleteRequest.onerror = function(event) {
                        console.log("Error deleting item");
                    };
                });
            
                interviewlistElem.append(listItem);    
            }
        };

        transaction.oncomplete = function(event) {
            toggleHiddenListHeaders();
        };
    }
};