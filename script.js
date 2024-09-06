// Ավելացնում ենք անհրաժեշտ EventListener-ները
document.getElementById('saveButton').addEventListener('click', saveData);
document.getElementById('searchButton').addEventListener('click', searchFiles);
document.getElementById('clearButton').addEventListener('click', function() {
    const confirmModal = document.getElementById('confirmModal');
    confirmModal.style.display = 'flex'; // Ցուցադրում ենք հաստատման պատուհանը
});
document.getElementById('confirmYes').addEventListener('click', function() {
    clearData(); // Կոչ ենք անում տվյալները ջնջելու ֆունկցիան
    document.getElementById('confirmModal').style.display = 'none'; // Փակում ենք հաստատման պատուհանը
});
document.getElementById('confirmNo').addEventListener('click', function() {
    document.getElementById('confirmModal').style.display = 'none'; // Փակում ենք հաստատման պատուհանը
});
document.getElementById('showAllButton').addEventListener('click', showAllFiles);

let editIndex = null; // Օգտագործվում է փոփոխման համար

// Պահպանում ենք տվյալները
function saveData() {
    const textInput = document.getElementById('textInput');
    let text = textInput.value.trim();
    const link = document.getElementById('linkInput').value.trim();
    const file = document.getElementById('imageInput').files[0];

    // Տեքստի ֆորմատավորում՝ որոշ մասերը հաստ և մուգ կանաչ դարձնելու համար
    text = text.replace(/\*(.*?)\*/g, '<span class="bold-green">$1</span>'); // Հաստ և մուգ կանաչ տեքստի համար
    text = text.replace(/\/(.*?)\//g, '<span class="bold-green">$1</span>'); // Հաստ և մուգ կանաչ տեքստի համար
    text = text.replace(/\n/g, '<br>'); // Նոր տողերի համար

    const reader = new FileReader();
    reader.onload = function(e) {
        let savedData = JSON.parse(localStorage.getItem('data')) || [];
        const imageData = file ? e.target.result : savedData[editIndex]?.image || '';

        if (editIndex !== null) {
            savedData[editIndex] = { text, link, image: imageData }; // Փոփոխում ենք տվյալները
            editIndex = null;
        } else {
            savedData.push({ text, link, image: imageData }); // Ավելացնում ենք նոր տվյալները
        }

        localStorage.setItem('data', JSON.stringify(savedData)); // Պահպանում ենք localStorage-ում
        clearInputs();
    };

    if (file) {
        reader.readAsDataURL(file);
    } else {
        let savedData = JSON.parse(localStorage.getItem('data')) || [];
        if (editIndex !== null) {
            savedData[editIndex] = { text, link, image: savedData[editIndex].image };
            editIndex = null;
        } else {
            savedData.push({ text, link, image: '' });
        }
        localStorage.setItem('data', JSON.stringify(savedData));
        clearInputs();
    }
}
// Որոնում ենք պահպանած տվյալների մեջ
function searchFiles() {
    const searchInput = document.getElementById('searchInput').value.trim().toLowerCase();
    const savedData = JSON.parse(localStorage.getItem('data')) || [];
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = ''; // Մաքրում ենք նախորդ արդյունքները

    // Որոնման դաշտում տառ չկա՝ ոչինչ չցուցադրել
    if (searchInput === '') {
        return;
    }

    savedData.forEach((item, index) => {
        if (item.text.toLowerCase().includes(searchInput) || item.link.toLowerCase().includes(searchInput)) {
            const resultItem = document.createElement('div');
            resultItem.className = 'saved-item';

            if (item.image) {
                const img = document.createElement('img');
                img.src = item.image;
                img.alt = 'Պահպանված նկար';
                img.style.cursor = 'pointer';
                img.addEventListener('click', function () {
                    openModal(item.image); // Բացում ենք մոդալ պատուհանը
                });
                resultItem.appendChild(img);
            }

            if (item.text) {
                const p = document.createElement('p');
                p.innerHTML = highlightText(item.text, searchInput);
                resultItem.appendChild(p);
            }

            if (item.link) {
                const button = document.createElement('button');
                button.textContent = 'Ինչպես գնալ';
                button.addEventListener('click', function () {
                    window.open(item.link, '_blank'); // Բացում ենք հղումը նոր պատուհանում
                });
                resultItem.appendChild(button);
            }

            const buttonsDiv = document.createElement('div');
            buttonsDiv.className = 'edit-delete-buttons';

            const editButton = document.createElement('button');
            editButton.textContent = 'Փոփոխել';
            editButton.addEventListener('click', function () {
                editItem(index); // Փոփոխման ֆունկցիան
            });
            
const deleteButton = document.createElement('button');
deleteButton.textContent = 'Ջնջել';
deleteButton.className = 'delete-button'; // Ավելացնում ենք կլասը
deleteButton.addEventListener('click', function () {
    deleteItem(index); // Ջնջման ֆունկցիան
});

            buttonsDiv.appendChild(editButton);
            buttonsDiv.appendChild(deleteButton);
            resultItem.appendChild(buttonsDiv);

            searchResults.appendChild(resultItem);
        }
    });
}
// Տեքստի ընդգծում որոնման ժամանակ
function highlightText(text, search) {
    if (!search.trim()) return text;

    const regex = new RegExp(`(${search})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// Մոդալ պատուհանի բացում նկարի համար
function openModal(imageSrc) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    modal.style.display = 'block'; // Ցուցադրում ենք մոդալ պատուհանը
    modalImage.src = imageSrc; // Կցում ենք նկարը

    // Փակում ենք մոդալ պատուհանը
    const span = document.getElementsByClassName('close')[0];
    span.onclick = function() {
        modal.style.display = 'none';
    }
}

// Պահպանած բոլոր տվյալների ցուցադրում
function showAllFiles() {
    const savedData = JSON.parse(localStorage.getItem('data')) || [];
    const allFilesResults = document.getElementById('allFilesResults');
    allFilesResults.innerHTML = '';

    savedData.forEach((item, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'saved-item';

        if (item.image) {
            const img = document.createElement('img');
            img.src = item.image;
            img.alt = 'Պահպանված նկար';
            img.style.cursor = 'pointer';
            img.addEventListener('click', function () {
                openModal(item.image); // Բացում ենք մոդալ պատուհանը
            });
            resultItem.appendChild(img);
        }

        if (item.text) {
            const p = document.createElement('p');
            p.innerHTML = item.text;
            resultItem.appendChild(p);
        }

        if (item.link) {
            const button = document.createElement('button');
            button.textContent = 'Ինչպես գնալ';
            button.addEventListener('click', function () {
                window.open(item.link, '_blank'); // Բացում ենք հղումը նոր պատուհանում
            });
            resultItem.appendChild(button);
        }

        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'edit-delete-buttons';

        const editButton = document.createElement('button');
        editButton.textContent = 'Փոփոխել';
        editButton.addEventListener('click', function () {
            editItem(index); // Փոփոխման ֆունկցիան
        });

        const deleteButton = document.createElement('button');
deleteButton.textContent = 'Ջնջել';
deleteButton.className = 'delete-button'; // Ավելացնում ենք կլասը
deleteButton.addEventListener('click', function () {
    deleteItem(index); // Ջնջման ֆունկցիան
});

        buttonsDiv.appendChild(editButton);
        buttonsDiv.appendChild(deleteButton);
        resultItem.appendChild(buttonsDiv);

        allFilesResults.appendChild(resultItem);
    });
}
// Ջնջում ենք պահպանած տվյալները
function clearData() {
    localStorage.clear();
    alert('Բոլոր տվյալները ջնջված են');
    document.getElementById('searchResults').innerHTML = '';
    document.getElementById('allFilesResults').innerHTML = '';
}

// Ջնջում ենք տվյալը ըստ ինդեքսի
function deleteItem(index) {
    let savedData = JSON.parse(localStorage.getItem('data')) || [];
    savedData.splice(index, 1);
    localStorage.setItem('data', JSON.stringify(savedData));
    searchFiles(); // Թարմացնում ենք որոնման արդյունքները
    showAllFiles(); // Թարմացնում ենք բոլոր տվյալների ցուցադրումը
}

// Փոփոխում ենք տվյալը
function editItem(index) {
    const savedData = JSON.parse(localStorage.getItem('data')) || [];
    const item = savedData[index];

    document.getElementById('textInput').value = item.text.replace(/<br>/g, '\n').replace(/<.*?>/g, ''); // Հեռացնում ենք HTML կոդը
    document.getElementById('linkInput').value = item.link;
    document.getElementById('imageInput').value = ''; // Մաքրում ենք նկարի ինպուտ դաշտը
    editIndex = index; // Նշում ենք փոփոխման ինդեքսը
}

// Մաքրում ենք բոլոր input դաշտերը
function clearInputs() {
    document.getElementById('textInput').value = '';
    document.getElementById('linkInput').value = '';
    document.getElementById('imageInput').value = '';
}

// Փակելու մոդալ պատուհանը
window.onclick = function(event) {
    const modal = document.getElementById('imageModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};
