document.getElementById('saveButton').addEventListener('click', saveData);
document.getElementById('searchButton').addEventListener('click', searchFiles);
document.getElementById('clearButton').addEventListener('click', function() {
    const confirmModal = document.getElementById('confirmModal');
    confirmModal.style.display = 'flex';  // Բացեք հաստատման պատուհանը
});
document.getElementById('confirmYes').addEventListener('click', function() {
    clearData();  // Ջնջում ենք ամբողջ ֆայլերը
    document.getElementById('confirmModal').style.display = 'none';  // Փակում ենք հաստատման պատուհանը
});
document.getElementById('confirmNo').addEventListener('click', function() {
    document.getElementById('confirmModal').style.display = 'none';  // Չեղարկում ենք և փակում ենք հաստատման պատուհանը
});
document.getElementById('showAllButton').addEventListener('click', showAllFiles);

let editIndex = null;

function saveData() {
    const textInput = document.getElementById('textInput');
    let text = textInput.value;  // Պահպանել տեքստը, ինչպես մուտքագրվել է
    const link = document.getElementById('linkInput').value.trim();
    const file = document.getElementById('imageInput').files[0];

    // Դարձնում ենք տեքստի որոշ մասը հաստ
    text = text.replace(/\/(.*?)\//g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<strong>$1</strong>');

    // Փոխարինում ենք նոր տողը HTML-ի <br> տարրով
    text = text.replace(/\n/g, '<br>');

    const reader = new FileReader();
    reader.onload = function(e) {
        let savedData = JSON.parse(localStorage.getItem('data')) || [];
        const imageData = file ? e.target.result : '';

        if (editIndex !== null) {
            savedData[editIndex] = { text, link, image: imageData };
            editIndex = null;
        } else {
            savedData.push({ text, link, image: imageData });
        }

        localStorage.setItem('data', JSON.stringify(savedData));
        clearInputs();
        // Այստեղ չենք կանչում searchFiles, որպեսզի նոր կերպով չցուցադրվի
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
        // Այստեղ չենք կանչում searchFiles, որպեսզի նոր կերպով չցուցադրվի
    }
}

function searchFiles() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const savedData = JSON.parse(localStorage.getItem('data')) || [];
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';

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
                    openModal(item.image);
                });
                resultItem.appendChild(img);
            }

            if (item.text) {
                const p = document.createElement('p');
                p.innerHTML = highlightText(item.text, searchInput);
                resultItem.appendChild(p);
            }

            if (item.link) {
                const a = document.createElement('a');
                a.href = item.link;
                a.innerHTML = highlightText(item.link, searchInput);
                resultItem.appendChild(a);
            }

            const buttonsDiv = document.createElement('div');
            buttonsDiv.className = 'edit-delete-buttons';

            const editButton = document.createElement('button');
            editButton.textContent = 'Փոփոխել';
            editButton.addEventListener('click', function () {
                editItem(index);
            });

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Ջնջել';
            deleteButton.addEventListener('click', function () {
                deleteItem(index);
            });

            buttonsDiv.appendChild(editButton);
            buttonsDiv.appendChild(deleteButton);
            resultItem.appendChild(buttonsDiv);

            searchResults.appendChild(resultItem);
        }
    });
}

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
                openModal(item.image);
            });
            resultItem.appendChild(img);
        }
        if (item.text) {
            const p = document.createElement('p');
            p.innerHTML = item.text;
            resultItem.appendChild(p);
        }
        if (item.link) {
            const a = document.createElement('a');
            a.href = item.link;
            a.textContent = item.link;
            resultItem.appendChild(a);
        }

        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'edit-delete-buttons';

        const editButton = document.createElement('button');
        editButton.textContent = 'Փոփոխել';
        editButton.addEventListener('click', function () {
            editItem(index);
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Ջնջել';
        deleteButton.addEventListener('click', function () {
            deleteItem(index);
        });

        buttonsDiv.appendChild(editButton);
        buttonsDiv.appendChild(deleteButton);
        resultItem.appendChild(buttonsDiv);

        allFilesResults.appendChild(resultItem);
    });
}

function clearInputs() {
    document.getElementById('textInput').value = '';
    document.getElementById('linkInput').value = '';
    document.getElementById('imageInput').value = '';
}

function clearData() {
    localStorage.removeItem('data');
    document.getElementById('searchResults').innerHTML = '';
    document.getElementById('allFilesResults').innerHTML = '';
}

function editItem(index) {
    const savedData = JSON.parse(localStorage.getItem('data')) || [];
    const item = savedData[index];

    document.getElementById('textInput').value = item.text;
    document.getElementById('linkInput').value = item.link;
    editIndex = index;
}

function deleteItem(index) {
    let savedData = JSON.parse(localStorage.getItem('data')) || [];
    savedData.splice(index, 1);
    localStorage.setItem('data', JSON.stringify(savedData));
    searchFiles();
}

function openModal(imageSrc) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    modal.style.display = 'block';
    modalImg.src = imageSrc;

    const closeModal = document.getElementsByClassName('close')[0];
    closeModal.onclick = function () {
        modal.style.display = 'none';
    };
}

window.onclick = function (event) {
    const modal = document.getElementById('imageModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};

document.getElementById('boldButton').addEventListener('click', function() {
    const textInput = document.getElementById('textInput');
    let text = textInput.value;
    const selectedText = window.getSelection().toString();

    if (selectedText) {
        text = text.replace(selectedText, `<strong>${selectedText}</strong>`);
        textInput.value = text;
        // Move the cursor to the end of the input
        textInput.focus();
        textInput.setSelectionRange(textInput.value.length, textInput.value.length);
    }
});

function highlightText(text, search) {
    if (!search.trim()) return text;

    const regex = new RegExp(`(${search})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}
