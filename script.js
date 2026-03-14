// script.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Floating Hearts Animation
    createHearts();

    // 2. Envelope Opening Logic
    const envelopeWrapper = document.getElementById('envelope-section');
    const envelope = document.querySelector('.envelope-wrapper');
    const mainContent = document.getElementById('main-content');
    
    envelope.addEventListener('click', () => {
        envelope.classList.add('open');
        
        // Wait for animation to finish, then show main content
        setTimeout(() => {
            envelopeWrapper.classList.add('hidden');
            mainContent.classList.remove('hidden');
            
            // Trigger reflow to start fade-in animation
            void mainContent.offsetWidth;
            mainContent.classList.add('visible');
        }, 1500);
    });

    // 3. Tab Navigation Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // 4. Diary Logic (LocalStorage)
    const editBtn = document.getElementById('edit-btn');
    const diaryEntriesContainer = document.getElementById('diary-entries');
    const diaryEditor = document.getElementById('diary-editor');
    const cancelBtn = document.getElementById('cancel-btn');
    const saveBtn = document.getElementById('save-btn');
    const entryTitle = document.getElementById('entry-title');
    const entryContent = document.getElementById('entry-content');

    // Load existing entries
    loadDiaryEntries();

    // Toggle Editor
    editBtn.addEventListener('click', () => {
        diaryEntriesContainer.classList.add('hidden');
        diaryEditor.classList.remove('hidden');
        entryTitle.focus();
    });

    cancelBtn.addEventListener('click', () => {
        diaryEditor.classList.add('hidden');
        diaryEntriesContainer.classList.remove('hidden');
        // Clear inputs
        entryTitle.value = '';
        entryContent.value = '';
    });

    saveBtn.addEventListener('click', () => {
        const titleText = entryTitle.value.trim();
        const contentText = entryContent.value.trim();

        if (contentText === '') {
            alert('Please write something in your diary before saving!');
            return;
        }

        const newEntry = {
            id: Date.now().toString(),
            title: titleText || 'Dear Diary...',
            content: contentText,
            date: new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };

        saveEntryToLocalStorage(newEntry);
        
        // Reset and switch back to view mode
        entryTitle.value = '';
        entryContent.value = '';
        diaryEditor.classList.add('hidden');
        diaryEntriesContainer.classList.remove('hidden');
        
        loadDiaryEntries();
    });

    function saveEntryToLocalStorage(entry) {
        let entries = JSON.parse(localStorage.getItem('shirinDiaryEntries') || '[]');
        // Add to beginning of array
        entries.unshift(entry);
        localStorage.setItem('shirinDiaryEntries', JSON.stringify(entries));
    }

    function loadDiaryEntries() {
        let entries = JSON.parse(localStorage.getItem('shirinDiaryEntries') || '[]');
        
        if (entries.length === 0) {
            diaryEntriesContainer.innerHTML = '<div class="entry empty-state">Your diary is empty. Click the pen to start writing!</div>';
            return;
        }

        diaryEntriesContainer.innerHTML = '';
        
        entries.forEach(entry => {
            const entryEl = document.createElement('div');
            entryEl.className = 'entry';
            
            // Convert newlines to <br> for HTML rendering
            const formattedContent = entry.content.replace(/\n/g, '<br>');

            entryEl.innerHTML = `
                <div class="entry-header">
                    <span>${entry.date}</span>
                    <button class="icon-btn delete-btn" data-id="${entry.id}" title="Delete Entry" style="font-size: 0.9rem; padding: 0;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="entry-title">${entry.title}</div>
                <p>${formattedContent}</p>
            `;
            
            diaryEntriesContainer.appendChild(entryEl);
        });

        // Add delete event listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                deleteEntry(id);
            });
        });
    }

    function deleteEntry(id) {
        if(confirm('Are you sure you want to delete this memory?')) {
            let entries = JSON.parse(localStorage.getItem('shirinDiaryEntries') || '[]');
            entries = entries.filter(e => e.id !== id);
            localStorage.setItem('shirinDiaryEntries', JSON.stringify(entries));
            loadDiaryEntries();
        }
    }

    // 5. Photo Gallery Logic (Base setup before Firebase)
    const photoUpload = document.getElementById('photo-upload');
    const galleryGrid = document.getElementById('gallery-grid');

    // Load cached photos from localStorage (as temporary fallback before cloud)
    loadLocalPhotos();

    photoUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // In a real cloud setup, we would upload to Firebase here.
        // For now, we'll convert to Base64 and save to localStorage 
        // (Note: localStorage has ~5MB limit, so this is just a placeholder until Firebase is connected)
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const photoData = event.target.result;
            savePhotoToLocal(photoData);
            loadLocalPhotos();
        };
        reader.readAsDataURL(file);
    });

    function savePhotoToLocal(dataUrl) {
        try {
            let photos = JSON.parse(localStorage.getItem('shirinPhotos') || '[]');
            photos.unshift({
                id: Date.now().toString(),
                url: dataUrl,
                date: new Date().toLocaleDateString()
            });
            localStorage.setItem('shirinPhotos', JSON.stringify(photos));
        } catch (e) {
            alert('Storage full! We need to connect that Google Cloud to save more photos. 😅');
        }
    }

    function loadLocalPhotos() {
        let photos = JSON.parse(localStorage.getItem('shirinPhotos') || '[]');
        
        if (photos.length === 0) {
            galleryGrid.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1;">No photos yet. Upload your first memory above!</div>';
            return;
        }

        galleryGrid.innerHTML = '';
        
        photos.forEach(photo => {
            const photoEl = document.createElement('div');
            photoEl.className = 'photo-card';
            photoEl.innerHTML = `
                <img src="${photo.url}" alt="Memory">
                <div class="date">${photo.date}</div>
            `;
            galleryGrid.appendChild(photoEl);
        });
    }
});

// Helper function to create floating hearts
function createHearts() {
    const container = document.getElementById('hearts-container');
    const heartCount = 15; // Number of floating hearts

    for (let i = 0; i < heartCount; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.classList.add('heart');
            
            // Random positioning and sizing
            const leftPos = Math.random() * 100;
            const size = Math.random() * 15 + 10;
            const animDuration = Math.random() * 5 + 8;
            
            heart.style.left = `${leftPos}%`;
            heart.style.width = `${size}px`;
            heart.style.height = `${size}px`;
            heart.style.animationDuration = `${animDuration}s`;
            
            // Adjust pseudo-elements size based on main heart size
            const style = document.createElement('style');
            style.innerHTML = `
                .heart:nth-child(${i + 1})::before, .heart:nth-child(${i + 1})::after {
                    width: ${size}px;
                    height: ${size}px;
                }
                .heart:nth-child(${i + 1})::before {
                    top: -${size/2}px;
                    left: 0;
                }
                .heart:nth-child(${i + 1})::after {
                    top: 0;
                    right: -${size/2}px;
                }
            `;
            document.head.appendChild(style);
            
            container.appendChild(heart);
        }, i * 500); // Stagger the start times
    }
}
