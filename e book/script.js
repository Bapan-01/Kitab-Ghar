// ========================================
// State Management
// ========================================
let books = [];
let categories = [];
let editingBookId = null;
let db; // IndexedDB database instance

// Admin profile state
let adminProfile = {
    username: 'admin',
    fullName: 'Admin User',
    email: 'admin@bookshelf.com',
    contact: '+1 234 567 8900',
    password: 'admin123' // In a real app, this would be hashed
};

// ========================================
// IndexedDB Setup - Native Browser API  
// No external libraries needed!
// ========================================
function initDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('EBookDatabase', 3);

        request.onerror = () => {
            console.error('Database failed to open');
            reject(request.error);
        };

        request.onsuccess = () => {
            db = request.result;
            console.log('Database opened successfully');
            resolve(db);
        };

        request.onupgradeneeded = (e) => {
            db = e.target.result;

            // Create object store for PDFs if it doesn't exist
            if (!db.objectStoreNames.contains('pdfs')) {
                const objectStore = db.createObjectStore('pdfs', { keyPath: 'id' });
                objectStore.createIndex('bookId', 'bookId', { unique: false });
                console.log('PDF object store created');
            }

            // Create object store for images if it doesn't exist
            if (!db.objectStoreNames.contains('images')) {
                db.createObjectStore('images', { keyPath: 'id' });
                console.log('Images object store created');
            }
        };
    });
}

// Store PDF file in IndexedDB
function storePDF(bookId, pdfFile) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject('Database not initialized');
            return;
        }

        const transaction = db.transaction(['pdfs'], 'readwrite');
        const objectStore = transaction.objectStore('pdfs');

        const pdfData = {
            id: bookId,
            bookId: bookId,
            fileName: pdfFile.name,
            fileType: pdfFile.type,
            fileSize: pdfFile.size,
            blob: pdfFile,
            uploadedAt: new Date()
        };

        const request = objectStore.put(pdfData);

        request.onsuccess = () => {
            console.log('PDF stored successfully for book:', bookId);
            resolve(bookId);
        };

        request.onerror = () => {
            console.error('Error storing PDF');
            reject(request.error);
        };
    });
}

// Retrieve PDF file from IndexedDB
function getPDF(bookId) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject('Database not initialized');
            return;
        }

        const transaction = db.transaction(['pdfs'], 'readonly');
        const objectStore = transaction.objectStore('pdfs');
        const request = objectStore.get(bookId);

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

// Delete PDF file from IndexedDB
function deletePDF(bookId) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject('Database not initialized');
            return;
        }

        const transaction = db.transaction(['pdfs'], 'readwrite');
        const objectStore = transaction.objectStore('pdfs');
        const request = objectStore.delete(bookId);

        request.onsuccess = () => {
            console.log('PDF deleted successfully');
            resolve();
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

// Download PDF file
function downloadPDF(bookId) {
    getPDF(bookId).then(pdfData => {
        if (pdfData && pdfData.blob) {
            const url = URL.createObjectURL(pdfData.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = pdfData.fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
            alert('PDF file not found');
        }
    }).catch(error => {
        console.error('Error downloading PDF:', error);
        alert('Error downloading PDF file');
    });

}

// Store Image in IndexedDB
function storeImage(id, imageFile) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject('Database not initialized');
            return;
        }

        const transaction = db.transaction(['images'], 'readwrite');
        const objectStore = transaction.objectStore('images');

        const imageData = {
            id: id,
            fileName: imageFile.name,
            fileType: imageFile.type,
            blob: imageFile,
            uploadedAt: new Date()
        };

        const request = objectStore.put(imageData);

        request.onsuccess = () => resolve(id);
        request.onerror = () => reject(request.error);
    });
}

// Get Image from IndexedDB
function getImage(id) {
    return new Promise((resolve, reject) => {
        if (!db) {
            resolve(null); // Return null instead of rejecting for UI safety
            return;
        }

        const transaction = db.transaction(['images'], 'readonly');
        const objectStore = transaction.objectStore('images');
        const request = objectStore.get(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
    });
}

// Delete Image from IndexedDB
function deleteImage(id) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject('Database not initialized');
            return;
        }

        const transaction = db.transaction(['images'], 'readwrite');
        const objectStore = transaction.objectStore('images');
        const request = objectStore.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Sample initial books
const initialBooks = [
    {
        id: generateId(),
        title: "The Art of Computer Programming",
        author: "Donald Knuth",
        category: "technology",
        pages: 672,
        pdfName: null,
        coverId: null,
        favorite: false,
        dateAdded: new Date('2024-01-15')
    },
    {
        id: generateId(),
        title: "Sapiens: A Brief History of Humankind",
        author: "Yuval Noah Harari",
        category: "non-fiction",
        pages: 443,
        pdfName: null,
        coverId: null,
        favorite: true,
        dateAdded: new Date('2024-02-20')
    },
    {
        id: generateId(),
        title: "Clean Code",
        author: "Robert C. Martin",
        category: "technology",
        pages: 464,
        pdfName: null,
        coverId: null,
        favorite: false,
        dateAdded: new Date('2024-03-10')
    },
    {
        id: generateId(),
        title: "The Lean Startup",
        author: "Eric Ries",
        category: "business",
        pages: 336,
        pdfName: null,
        coverId: null,
        favorite: true,
        dateAdded: new Date('2024-01-25')
    },
    {
        id: generateId(),
        title: "A Brief History of Time",
        author: "Stephen Hawking",
        category: "science",
        pages: 256,
        pdfName: null,
        coverId: null,
        favorite: false,
        dateAdded: new Date('2024-02-05')
    },
    {
        id: generateId(),
        title: "1984",
        author: "George Orwell",
        category: "fiction",
        pages: 328,
        pdfName: null,
        coverId: null,
        favorite: true,
        dateAdded: new Date('2024-03-01')
    }
];

// ========================================
// Utility Functions
// ========================================
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function saveToLocalStorage() {
    localStorage.setItem('ebookLibrary', JSON.stringify(books));
}

const defaultCategories = ['fiction', 'non-fiction', 'science', 'technology', 'business'];

function loadCategories() {
    const stored = localStorage.getItem('ebookCategories');
    if (stored) {
        categories = JSON.parse(stored);
    } else {
        categories = [...defaultCategories];
        saveCategories();
    }
}

function saveCategories() {
    localStorage.setItem('ebookCategories', JSON.stringify(categories));
    updateCategoryDropdowns();
}

function addCategory(name) {
    const cleanName = name.toLowerCase().trim();
    if (cleanName && !categories.includes(cleanName)) {
        categories.push(cleanName);
        saveCategories();
        renderCategoriesPage();
        return true;
    }
    return false;
}

function deleteCategory(name) {
    if (confirm(`Delete category "${name}"?`)) {
        categories = categories.filter(c => c !== name);
        saveCategories();
        renderCategoriesPage();
    }
}

function updateCategoryDropdowns() {
    // Update Filter
    if (categoryFilter) {
        const currentValue = categoryFilter.value;
        const options = categories.map(c =>
            `<option value="${c}">${c.charAt(0).toUpperCase() + c.slice(1)}</option>`
        ).join('');

        categoryFilter.innerHTML = `<option value="all">All Categories</option>${options}`;
        categoryFilter.value = currentValue; // Try to keep selection
    }

    // Update Book Form Dropdown
    const bookCategorySelect = document.getElementById('bookCategory');
    if (bookCategorySelect) {
        const currentValue = bookCategorySelect.value;
        const options = categories.map(c =>
            `<option value="${c}">${c.charAt(0).toUpperCase() + c.slice(1)}</option>`
        ).join('');

        bookCategorySelect.innerHTML = options;
        if (currentValue && categories.includes(currentValue)) {
            bookCategorySelect.value = currentValue;
        }
    }
}

// Render Categories Management Page
function renderCategoriesPage() {
    const categoriesList = document.getElementById('categoriesList');
    if (!categoriesList) return;

    if (categories.length === 0) {
        categoriesList.innerHTML = '<div class="empty-state"><p>No categories found.</p></div>';
        return;
    }

    // Calculate stats per category
    const stats = {};
    categories.forEach(c => stats[c] = 0);
    books.forEach(b => {
        if (stats.hasOwnProperty(b.category)) {
            stats[b.category]++;
        }
    });

    categoriesList.innerHTML = categories.map(c => `
        <div class="category-card">
            <div class="category-info">
                <h3 class="category-name">${c.charAt(0).toUpperCase() + c.slice(1)}</h3>
                <span class="category-count">${stats[c] || 0} books</span>
            </div>
            <button class="btn-icon delete" onclick="deleteCategory('${c}')" title="Delete Category">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        </div>
    `).join('');
}

function loadFromLocalStorage() {
    const stored = localStorage.getItem('ebookLibrary');
    if (stored) {
        books = JSON.parse(stored).map(book => ({
            ...book,
            dateAdded: new Date(book.dateAdded)
        }));
    } else {
        books = initialBooks;
        saveToLocalStorage();
    }
}

function saveAdminProfile() {
    localStorage.setItem('adminProfile', JSON.stringify(adminProfile));
}

function loadAdminProfile() {
    const stored = localStorage.getItem('adminProfile');
    if (stored) {
        adminProfile = JSON.parse(stored);
    } else {
        saveAdminProfile();
    }
}

function updateSidebarProfile() {
    const adminNameEl = document.querySelector('.admin-name');
    if (adminNameEl) {
        adminNameEl.textContent = adminProfile.fullName || adminProfile.username;
    }

    // Update avatar
    const avatarImg = document.getElementById('sidebarAvatarImg');
    const avatarSvg = document.getElementById('sidebarAvatarSvg');

    if (adminProfile.avatarId && avatarImg && avatarSvg) {
        getImage(adminProfile.avatarId).then(imageData => {
            if (imageData && imageData.blob) {
                const url = URL.createObjectURL(imageData.blob);
                avatarImg.src = url;
                avatarImg.style.display = 'block';
                avatarSvg.style.display = 'none';
            }
        });
    }
}

// ========================================
// DOM Elements
// ========================================
const booksGrid = document.getElementById('booksGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const sortFilter = document.getElementById('sortFilter');
const addBookBtn = document.getElementById('addBookBtn');
const bookModal = document.getElementById('bookModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const bookForm = document.getElementById('bookForm');
const modalTitle = document.getElementById('modalTitle');

// Sidebar elements
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebarClose = document.getElementById('sidebarClose');
const sidebarLinks = document.querySelectorAll('.sidebar-link');

// Stats elements
const totalBooksEl = document.getElementById('totalBooks');
const categoriesCountEl = document.getElementById('categoriesCount');
const favoritesCountEl = document.getElementById('favoritesCount');

// Account form elements
const accountForm = document.getElementById('accountForm');
const adminUsernameInput = document.getElementById('adminUsername');
const adminFullNameInput = document.getElementById('adminFullName');
const adminEmailInput = document.getElementById('adminEmail');
const adminRoleInput = document.getElementById('adminRole');

const adminPasswordInput = document.getElementById('adminPassword');
const adminConfirmPasswordInput = document.getElementById('adminConfirmPassword');
const cancelAccountBtn = document.getElementById('cancelAccountBtn');
const accountAvatarImg = document.getElementById('accountAvatarImg');
const accountAvatarSvg = document.getElementById('accountAvatarSvg');
const editAvatarBtn = document.getElementById('editAvatarBtn');
const avatarUpload = document.getElementById('avatarUpload');

// ========================================
// Render Functions
// ========================================
function renderBooks(booksToRender = books) {
    if (booksToRender.length === 0) {
        booksGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                <h3>No books found</h3>
                <p>Add your first book to get started!</p>
            </div>
        `;
        return;
    }

    booksGrid.innerHTML = booksToRender.map(book => `
        <div class="book-card" data-id="${book.id}">
            <div class="book-cover">
                <img id="cover-${book.id}" src="" alt="${escapeHtml(book.title)} Cover" style="display: none;">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                ${book.pdfName ? '<span class="pdf-badge">PDF</span>' : ''}
            </div>
            <div class="book-info">
                <h3 class="book-title">${escapeHtml(book.title)}</h3>
                <p class="book-author">by ${escapeHtml(book.author)}</p>
                <div class="book-meta">
                    <span class="book-category">${book.category}</span>
                    ${book.pages ? `<span class="book-pages">${book.pages} pages</span>` : ''}
                </div>
                <div class="book-actions">
                    ${book.pdfName ? `
                    <button class="book-action-btn download" 
                            onclick="downloadPDF('${book.id}')"
                            title="Download PDF">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                    </button>
                    ` : ''}
                    <button class="book-action-btn favorite ${book.favorite ? 'active' : ''}" 
                            onclick="toggleFavorite('${book.id}')" 
                            title="${book.favorite ? 'Remove from favorites' : 'Add to favorites'}">
                        <svg viewBox="0 0 24 24" fill="${book.favorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                    <button class="book-action-btn edit" 
                            onclick="openEditModal('${book.id}')"
                            title="Edit book">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="book-action-btn delete" 
                            onclick="deleteBook('${book.id}')"
                            title="Delete book">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Post-render: Load images
    booksToRender.forEach(book => {
        if (book.coverId) {
            getImage(book.coverId).then(imageData => {
                if (imageData && imageData.blob) {
                    const imgEl = document.getElementById(`cover-${book.id}`);
                    if (imgEl) {
                        imgEl.src = URL.createObjectURL(imageData.blob);
                        imgEl.style.display = 'block';
                    }
                }
            });
        }
    });
}

function updateStats() {
    totalBooksEl.textContent = books.length;

    const uniqueCategories = new Set(books.map(book => book.category));
    categoriesCountEl.textContent = uniqueCategories.size;

    const favoritesCount = books.filter(book => book.favorite).length;
    favoritesCountEl.textContent = favoritesCount;
}

function updateCategoryStats() {
    const fictionCount = books.filter(book => book.category === 'fiction').length;
    const techCount = books.filter(book => book.category === 'technology').length;
    const scienceCount = books.filter(book => book.category === 'science').length;
    const businessCount = books.filter(book => book.category === 'business').length;

    const fictionEl = document.getElementById('fictionCount');
    const techEl = document.getElementById('techCount');
    const scienceEl = document.getElementById('scienceCount');
    const businessEl = document.getElementById('businessCount');

    if (fictionEl) fictionEl.textContent = fictionCount;
    if (techEl) techEl.textContent = techCount;
    if (scienceEl) scienceEl.textContent = scienceCount;
    if (businessEl) businessEl.textContent = businessCount;
}

function renderFavoriteBooks() {
    const favoriteBooks = books.filter(book => book.favorite);
    const favoriteBooksGrid = document.getElementById('favoriteBooksGrid');

    if (!favoriteBooksGrid) return;

    if (favoriteBooks.length === 0) {
        favoriteBooksGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <h3>No favorite books yet</h3>
                <p>Mark books as favorites to see them here!</p>
            </div>
        `;
        return;
    }

    favoriteBooksGrid.innerHTML = favoriteBooks.map(book => `
        <div class="book-card" data-id="${book.id}">
            <div class="book-cover">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
            </div>
            <div class="book-info">
                <h3 class="book-title">${escapeHtml(book.title)}</h3>
                <p class="book-author">by ${escapeHtml(book.author)}</p>
                <div class="book-meta">
                    <span class="book-category">${book.category}</span>
                    ${book.pages ? `<span class="book-pages">${book.pages} pages</span>` : ''}
                </div>
                <div class="book-actions">
                    <button class="book-action-btn favorite active" 
                            onclick="toggleFavorite('${book.id}')" 
                            title="Remove from favorites">
                        <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                    <button class="book-action-btn edit" 
                            onclick="openEditModal('${book.id}')"
                            title="Edit book">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="book-action-btn delete" 
                            onclick="deleteBook('${book.id}')"
                            title="Delete book">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// Book Operations
// ========================================
function addBook(bookData) {
    const newBook = {
        id: bookData.id || generateId(),
        title: bookData.title,
        author: bookData.author,
        category: bookData.category,
        pages: bookData.pages,
        pdfName: bookData.pdfName || null,
        coverId: bookData.coverId || null,
        favorite: false,
        dateAdded: new Date()
    };

    books.unshift(newBook);
    saveToLocalStorage();
    applyFilters();
    updateStats();
}

function updateBook(id, bookData) {
    const index = books.findIndex(book => book.id === id);
    if (index !== -1) {
        books[index] = {
            ...books[index],
            ...bookData
        };
        saveToLocalStorage();
        applyFilters();
        updateStats();
    }
}

function deleteBook(id) {
    if (confirm('Are you sure you want to delete this book?')) {
        const book = books.find(b => b.id === id);

        // Delete PDF from IndexedDB if it exists
        if (book && book.pdfName) {
            deletePDF(id).catch(err => console.log('No PDF to delete or error:', err));
        }

        // Delete Cover Image from IndexedDB
        if (book && book.coverId) {
            deleteImage(book.coverId).catch(err => console.log('No cover to delete or error:', err));
        }

        // Delete book from array
        books = books.filter(book => book.id !== id);
        saveToLocalStorage();
        applyFilters();
        updateStats();

        // Update favorites page if it's showing
        const favoritesPage = document.getElementById('favoritesPage');
        if (favoritesPage && favoritesPage.classList.contains('active')) {
            renderFavoriteBooks();
        }
    }
}

function toggleFavorite(id) {
    const book = books.find(book => book.id === id);
    if (book) {
        book.favorite = !book.favorite;
        saveToLocalStorage();
        applyFilters();
        updateStats();

        // Update favorites page if it's showing
        const favoritesPage = document.getElementById('favoritesPage');
        if (favoritesPage && favoritesPage.classList.contains('active')) {
            renderFavoriteBooks();
        }
    }
}

// ========================================
// Filter & Search
// ========================================
function applyFilters() {
    let filtered = [...books];

    // Search filter
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm) {
        filtered = filtered.filter(book =>
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.category.toLowerCase().includes(searchTerm) ||
            (book.pdfName && book.pdfName.toLowerCase().includes(searchTerm))
        );
    }

    // Category filter
    const category = categoryFilter.value;
    if (category !== 'all') {
        filtered = filtered.filter(book => book.category === category);
    }

    // Sort filter
    const sortBy = sortFilter.value;
    switch (sortBy) {
        case 'title':
            filtered.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'author':
            filtered.sort((a, b) => a.author.localeCompare(b.author));
            break;
        case 'recent':
        default:
            filtered.sort((a, b) => b.dateAdded - a.dateAdded);
            break;
    }

    renderBooks(filtered);
}

// ========================================
// Sidebar Functions
// ========================================
function openSidebar() {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

function handleNavigation(page) {
    // Update active state in sidebar
    sidebarLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });

    // Hide all page sections
    const allPages = document.querySelectorAll('.page-section');
    allPages.forEach(pageSection => {
        pageSection.classList.remove('active');
    });

    // Show the selected page
    const pageMap = {
        'dashboard': 'dashboardPage',
        'library': 'libraryPage',
        'categories': 'categoriesPage',
        'favorites': 'favoritesPage',
        'users': 'usersPage',
        'analytics': 'analyticsPage',
        'account': 'accountPage'
    };

    const targetPageId = pageMap[page];
    const targetPage = document.getElementById(targetPageId);

    if (targetPage) {
        targetPage.classList.add('active');

        // Update content based on page
        if (page === 'favorites') {
            renderFavoriteBooks();
        } else if (page === 'categories') {
            updateCategoryStats();
        } else if (page === 'account') {
            loadAccountData();
        }
    }

    // Close sidebar after navigation on mobile
    if (window.innerWidth <= 768) {
        closeSidebar();
    }
}

// ========================================
// Account Functions
// ========================================
function loadAccountData() {
    if (adminUsernameInput) adminUsernameInput.value = adminProfile.username || '';
    if (adminFullNameInput) adminFullNameInput.value = adminProfile.fullName || '';
    if (adminEmailInput) adminEmailInput.value = adminProfile.email || '';
    if (adminRoleInput) adminRoleInput.value = adminProfile.role || 'Administrator';
    // Password fields are intentionally left blank for security

    // Load Avatar
    if (adminProfile.avatarId && accountAvatarImg && accountAvatarSvg) {
        getImage(adminProfile.avatarId).then(imageData => {
            if (imageData && imageData.blob) {
                const url = URL.createObjectURL(imageData.blob);
                accountAvatarImg.src = url;
                accountAvatarImg.style.display = 'block';
                accountAvatarSvg.style.display = 'none';
            } else {
                // Fallback if image not found
                accountAvatarImg.style.display = 'none';
                accountAvatarSvg.style.display = 'block';
            }
        });
    }
}

function saveAccountData(formData) {
    const password = formData.password.trim();
    const confirmPassword = formData.confirmPassword.trim();

    // Validate password if provided
    if (password) {
        if (password.length < 6) {
            alert('Password must be at least 6 characters long');
            return false;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return false;
        }

        adminProfile.password = password;
    }

    // Update profile
    adminProfile.username = formData.username.trim();
    adminProfile.fullName = formData.fullName.trim();
    adminProfile.email = formData.email.trim();
    // Role is read-only usually, but we keep it in profile
    if (!adminProfile.role) adminProfile.role = 'Administrator';

    // Save to localStorage
    saveAdminProfile();

    // Sync changes to session user (currentUser) so they persist if we relogin/reload
    const sessionUser = localStorage.getItem('currentUser');
    if (sessionUser) {
        const currentUser = JSON.parse(sessionUser);
        currentUser.name = adminProfile.fullName;
        currentUser.email = adminProfile.email;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    // Update sidebar display
    updateSidebarProfile();

    // Clear password fields
    if (adminPasswordInput) adminPasswordInput.value = '';
    if (adminConfirmPasswordInput) adminConfirmPasswordInput.value = '';

    alert('Profile updated successfully!');
    return true;
}

// ========================================
// Modal Functions
// ========================================
function openAddModal() {
    editingBookId = null;
    modalTitle.textContent = 'Add New Book';
    bookForm.reset();

    // Reset PDF hint text
    const pdfInput = document.getElementById('bookPdf');
    if (pdfInput) {
        const hint = pdfInput.nextElementSibling;
        if (hint && hint.classList.contains('form-hint')) {
            hint.textContent = 'Select a PDF file for this e-book (optional)';
        }
    }

    bookModal.classList.add('active');
}

function openEditModal(id) {
    const book = books.find(book => book.id === id);
    if (!book) return;

    editingBookId = id;
    modalTitle.textContent = 'Edit Book';

    document.getElementById('bookTitle').value = book.title;
    document.getElementById('bookAuthor').value = book.author;
    document.getElementById('bookCategory').value = book.category;
    document.getElementById('bookPages').value = book.pages || '';

    // Note: File input cannot be pre-filled for security reasons
    // Display current PDF name if exists
    const pdfInput = document.getElementById('bookPdf');
    if (book.pdfName && pdfInput) {
        const hint = pdfInput.nextElementSibling;
        if (hint && hint.classList.contains('form-hint')) {
            hint.textContent = `Current file: ${book.pdfName} (select new file to replace)`;
        }
    }

    // Display current Cover status
    const coverInput = document.getElementById('bookCover');
    if (book.coverId && coverInput) {
        const hint = coverInput.nextElementSibling;
        if (hint && hint.classList.contains('form-hint')) {
            hint.textContent = `Cover image is set (select new file to replace)`;
        }
    }

    bookModal.classList.add('active');
}

function closeBookModal() {
    bookModal.classList.remove('active');
    bookForm.reset();
    editingBookId = null;

    // Reset PDF hint text
    const pdfInput = document.getElementById('bookPdf');
    if (pdfInput) {
        const hint = pdfInput.nextElementSibling;
        if (hint && hint.classList.contains('form-hint')) {
            hint.textContent = 'Select a PDF file for this e-book (optional)';
        }
    }

    // Reset Cover hint text
    const coverInput = document.getElementById('bookCover');
    if (coverInput) {
        const hint = coverInput.nextElementSibling;
        if (hint && hint.classList.contains('form-hint')) {
            hint.textContent = 'Select a cover image (jpg, png, webp)';
        }
    }
}

// ========================================
// Event Listeners
// ========================================

// Sidebar listeners
hamburgerBtn.addEventListener('click', openSidebar);
sidebarClose.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);

// Logout listener
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            // Clear session
            localStorage.removeItem('currentUser');

            // Redirect to login page
            window.location.href = 'login.html';
        }
    });
}

// Sidebar navigation
sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        handleNavigation(page);
    });
});

// Modal listeners
addBookBtn.addEventListener('click', openAddModal);
closeModal.addEventListener('click', closeBookModal);
cancelBtn.addEventListener('click', closeBookModal);

// Close modal when clicking outside
bookModal.addEventListener('click', (e) => {
    if (e.target === bookModal) {
        closeBookModal();
    }
});

// ========================================
// Form submission with PDF storage
// Using IndexedDB (native browser API)
// ========================================
bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const pdfInput = document.getElementById('bookPdf');
    const pdfFile = pdfInput.files[0];

    const coverInput = document.getElementById('bookCover');
    const coverFile = coverInput ? coverInput.files[0] : null;

    const formData = {
        title: document.getElementById('bookTitle').value.trim(),
        author: document.getElementById('bookAuthor').value.trim(),
        category: document.getElementById('bookCategory').value,
        pages: parseInt(document.getElementById('bookPages').value) || null,
        pdfName: pdfFile ? pdfFile.name : null,
        coverId: null
    };

    // Validate PDF file if provided
    if (pdfFile && pdfFile.type !== 'application/pdf') {
        alert('Please select a valid PDF file');
        return;
    }

    // Validate Cover Image if provided
    if (coverFile) {
        if (!coverFile.type.startsWith('image/')) {
            alert('Please select a valid image file for the cover is required');
            return;
        }
        if (coverFile.size > 2 * 1024 * 1024) {
            alert('Cover image size should be less than 2MB');
            return;
        }
    }

    try {
        let coverIdToSave = null;

        if (editingBookId) {
            // Editing existing book
            const existingBook = books.find(b => b.id === editingBookId);

            // Handle PDF
            if (pdfFile) {
                await storePDF(editingBookId, pdfFile);
            } else if (existingBook) {
                formData.pdfName = existingBook.pdfName;
            }

            // Handle Cover
            if (coverFile) {
                // If there was an old cover, overwrite it (using new ID or same? Better new ID to be safe or update)
                // Let's use `cover_${bookId}` pattern or just random ID
                const newCoverId = `cover_${editingBookId}`;
                await storeImage(newCoverId, coverFile);
                formData.coverId = newCoverId;
            } else if (existingBook) {
                formData.coverId = existingBook.coverId;
            }

            updateBook(editingBookId, formData);
        } else {
            // Adding new book
            const newBookId = generateId();

            // Store PDF
            if (pdfFile) {
                await storePDF(newBookId, pdfFile);
            }

            // Store Cover
            if (coverFile) {
                const newCoverId = `cover_${newBookId}`;
                await storeImage(newCoverId, coverFile);
                formData.coverId = newCoverId;
            }

            // Add book
            addBook({
                id: newBookId,
                title: formData.title,
                author: formData.author,
                category: formData.category,
                pages: formData.pages,
                pdfName: formData.pdfName,
                coverId: formData.coverId
            });
        }

        closeBookModal();
    } catch (error) {
        console.error('Error saving book:', error);
        alert('Error saving book. Please try again.');
    }
});

// Account form submission
if (accountForm) {
    accountForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = {
            username: adminUsernameInput.value,
            fullName: adminFullNameInput.value,
            email: adminEmailInput.value,
            // contact: adminContactInput.value, // Removed
            password: adminPasswordInput.value,
            confirmPassword: adminConfirmPasswordInput.value
        };

        saveAccountData(formData);
    });
}

// Cancel account button
if (cancelAccountBtn) {
    cancelAccountBtn.addEventListener('click', () => {
        loadAccountData();
        alert('Changes cancelled');
    });
}

// Search and filter listeners
// Account Avatar Upload
if (editAvatarBtn && avatarUpload) {
    editAvatarBtn.addEventListener('click', () => {
        avatarUpload.click();
    });

    avatarUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file');
            return;
        }

        // Limit size to 2MB to be safe
        if (file.size > 2 * 1024 * 1024) {
            alert('Image size should be less than 2MB');
            return;
        }

        try {
            const avatarId = 'admin_avatar'; // Use consistent ID for single user
            await storeImage(avatarId, file);

            adminProfile.avatarId = avatarId;
            saveAdminProfile();

            // Update UI immediately
            const url = URL.createObjectURL(file);

            if (accountAvatarImg && accountAvatarSvg) {
                accountAvatarImg.src = url;
                accountAvatarImg.style.display = 'block';
                accountAvatarSvg.style.display = 'none';
            }

            updateSidebarProfile();
            alert('Profile photo updated!');

        } catch (error) {
            console.error('Error saving avatar:', error);
            alert('Failed to save profile photo');
        }
    });
}

searchInput.addEventListener('input', applyFilters);
categoryFilter.addEventListener('change', applyFilters);
sortFilter.addEventListener('change', applyFilters);

// Category Management Listeners
const addCategoryBtn = document.getElementById('addCategoryBtn');
const newCategoryInput = document.getElementById('newCategoryInput');

if (addCategoryBtn && newCategoryInput) {
    addCategoryBtn.addEventListener('click', () => {
        const name = newCategoryInput.value;
        if (addCategory(name)) {
            newCategoryInput.value = '';
            alert(`Category "${name}" added successfully`);
        } else {
            alert('Invalid category name or already exists');
        }
    });

    // Add on Enter key
    newCategoryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addCategoryBtn.click();
        }
    });
}

// ========================================
// Theme Management
// ========================================
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Set initial theme
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateThemeIcon(true);
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        updateThemeIcon(false);
    }

    // Add event listener
    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme === 'dark');
}

function updateThemeIcon(isDark) {
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    if (sunIcon && moonIcon) {
        if (isDark) {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        } else {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        }
    }
}

// ========================================
// Initialize App
// ========================================
async function init() {
    try {
        // Initialize IndexedDB first
        await initDatabase();
        console.log('✓ IndexedDB initialized - PDFs will persist!');

        // Initialize Theme
        initTheme();

        // Then load data and render
        loadAdminProfile();

        // Initialize Categories
        loadCategories();
        loadFromLocalStorage();

        renderBooks();
        updateStats();
        updateSidebarProfile();
        updateCategoryDropdowns();
        renderCategoriesPage();
    } catch (error) {
        console.error('Error initializing app:', error);
        alert('Error initializing application. Some features may not work properly.');
    }
}

// Start the application
init();
