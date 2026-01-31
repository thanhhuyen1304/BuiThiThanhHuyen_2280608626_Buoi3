// dashboard.js
// Exports getAll() which fetches products and renders them into the table.

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const itemsPerPage = 10;
let sortField = null;
let sortOrder = 'asc'; // 'asc' or 'desc'

function getTotalPages(list) {
  return Math.ceil(list.length / itemsPerPage);
}

function renderProductsPage(list, page) {
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;
  if (!list || list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8">No products</td></tr>';
    updatePaginationUI(list);
    return;
  }

  const totalPages = getTotalPages(list);
  if (page < 1) page = 1;
  if (page > totalPages) page = totalPages;
  currentPage = page;

  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageProducts = list.slice(start, end);

  tbody.innerHTML = '';
  pageProducts.forEach((p) => {
    const tr = document.createElement('tr');

    const idTd = document.createElement('td');
    idTd.textContent = (p.id !== undefined && p.id !== null) ? p.id : '';

    const imgTd = document.createElement('td');
    imgTd.classList.add('image-cell');
    
    const images = Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []);
    
    if (images.length > 0) {
      const gallery = document.createElement('div');
      gallery.classList.add('image-gallery');
      gallery.setAttribute('data-product-id', p.id);
      
      const img = document.createElement('img');
      img.src = images[0];
      img.alt = p.title || 'product image';
      img.classList.add('gallery-img');
      
      gallery.appendChild(img);
      
      if (images.length > 1) {
        const galleyNav = document.createElement('div');
        galleyNav.classList.add('gallery-nav');
        
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '◀';
        prevBtn.classList.add('gallery-btn', 'gallery-prev');
        prevBtn.title = 'Hình trước';
        prevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const imgs = gallery.querySelectorAll('.gallery-img');
          const current = Array.from(imgs).findIndex(i => i.style.display !== 'none');
          const next = current > 0 ? current - 1 : imgs.length - 1;
          Array.from(imgs).forEach(i => i.style.display = 'none');
          imgs[next].style.display = 'block';
          const info = gallery.querySelector('.gallery-info');
          if (info) info.textContent = (next + 1) + '/' + imgs.length;
          prevBtn.blur();
        });
        
        const nextBtn = document.createElement('button');
        nextBtn.textContent = '▶';
        nextBtn.classList.add('gallery-btn', 'gallery-next');
        nextBtn.title = 'Hình tiếp';
        nextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const imgs = gallery.querySelectorAll('.gallery-img');
          const current = Array.from(imgs).findIndex(i => i.style.display !== 'none');
          const next = current < imgs.length - 1 ? current + 1 : 0;
          Array.from(imgs).forEach(i => i.style.display = 'none');
          imgs[next].style.display = 'block';
          const info = gallery.querySelector('.gallery-info');
          if (info) info.textContent = (next + 1) + '/' + imgs.length;
          nextBtn.blur();
        });
        
        const info = document.createElement('span');
        info.classList.add('gallery-info');
        info.textContent = '1/' + images.length;
        
        galleyNav.appendChild(prevBtn);
        galleyNav.appendChild(info);
        galleyNav.appendChild(nextBtn);
        gallery.appendChild(galleyNav);
      }
      
      // Add hidden images
      for (let i = 1; i < images.length; i++) {
        const hiddenImg = document.createElement('img');
        hiddenImg.src = images[i];
        hiddenImg.alt = p.title || 'product image';
        hiddenImg.classList.add('gallery-img');
        hiddenImg.style.display = 'none';
        gallery.appendChild(hiddenImg);
      }
      
      imgTd.appendChild(gallery);
    } else {
      imgTd.textContent = 'No image';
    }

    const titleTd = document.createElement('td');
    titleTd.textContent = p.title || '';

    const priceTd = document.createElement('td');
    if (typeof p.price === 'number') {
      priceTd.textContent = p.price.toLocaleString('vi-VN') + ' ₫';
      priceTd.classList.add('price');
    } else {
      priceTd.textContent = (p.price || '');
    }

    const categoryTd = document.createElement('td');
    categoryTd.textContent = (p.category && p.category.name) ? p.category.name : '';

    const descTd = document.createElement('td');
    descTd.classList.add('desc');
    descTd.textContent = p.description || '';

    const createdTd = document.createElement('td');
    createdTd.textContent = p.creationAt ? (new Date(p.creationAt)).toLocaleString('vi-VN') : '';

    const updatedTd = document.createElement('td');
    updatedTd.textContent = p.updatedAt ? (new Date(p.updatedAt)).toLocaleString('vi-VN') : '';

    tr.appendChild(idTd);
    tr.appendChild(imgTd);
    tr.appendChild(titleTd);
    tr.appendChild(priceTd);
    tr.appendChild(categoryTd);
    tr.appendChild(descTd);
    tr.appendChild(createdTd);
    tr.appendChild(updatedTd);

    tbody.appendChild(tr);
  });

  updatePaginationUI(list);
}

function updatePaginationUI(list) {
  const totalPages = getTotalPages(list);
  const infoSpan = document.getElementById('pagination-info');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  if (infoSpan) {
    infoSpan.textContent = `Trang ${currentPage} / ${totalPages} (${list.length} kết quả)`;
  }
  if (prevBtn) prevBtn.disabled = currentPage <= 1;
  if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
}

function setupPagination() {
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      renderProductsPage(filteredProducts, currentPage - 1);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      renderProductsPage(filteredProducts, currentPage + 1);
    });
  }
}

function setupSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;
  input.addEventListener('input', (e) => {
    const q = (e.target.value || '').trim().toLowerCase();
    if (!q) {
      filteredProducts = allProducts;
    } else {
      filteredProducts = allProducts.filter(p => (p.title || '').toLowerCase().includes(q));
    }
    currentPage = 1;
    applySort();
    renderProductsPage(filteredProducts, 1);
  });
}

function applySort() {
  if (!sortField) return;
  
  const sorted = [...filteredProducts];
  sorted.sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    // Handle nested properties (e.g., category.name)
    if (sortField === 'category' && a.category && b.category) {
      aVal = a.category.name || '';
      bVal = b.category.name || '';
    }
    
    // Handle null/undefined
    if (aVal == null) aVal = '';
    if (bVal == null) bVal = '';
    
    // Numeric sort for price
    if (sortField === 'price') {
      aVal = typeof aVal === 'number' ? aVal : 0;
      bVal = typeof bVal === 'number' ? bVal : 0;
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    // String sort for title
    aVal = String(aVal).toLowerCase();
    bVal = String(bVal).toLowerCase();
    if (sortOrder === 'asc') {
      return aVal.localeCompare(bVal, 'vi');
    } else {
      return bVal.localeCompare(aVal, 'vi');
    }
  });
  
  filteredProducts = sorted;
}

function setupSort() {
  const titleBtn = document.getElementById('sort-title-btn');
  const priceBtn = document.getElementById('sort-price-btn');
  const clearBtn = document.getElementById('clear-sort-btn');
  
  if (titleBtn) {
    titleBtn.addEventListener('click', () => {
      if (sortField === 'title') {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        sortField = 'title';
        sortOrder = 'asc';
      }
      currentPage = 1;
      applySort();
      renderProductsPage(filteredProducts, 1);
      updateSortButtonUI();
    });
  }
  
  if (priceBtn) {
    priceBtn.addEventListener('click', () => {
      if (sortField === 'price') {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        sortField = 'price';
        sortOrder = 'asc';
      }
      currentPage = 1;
      applySort();
      renderProductsPage(filteredProducts, 1);
      updateSortButtonUI();
    });
  }
  
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      sortField = null;
      sortOrder = 'asc';
      filteredProducts = [...allProducts];
      applySearch();
      currentPage = 1;
      renderProductsPage(filteredProducts, 1);
      updateSortButtonUI();
    });
  }
}

function updateSortButtonUI() {
  const titleBtn = document.getElementById('sort-title-btn');
  const priceBtn = document.getElementById('sort-price-btn');
  const clearBtn = document.getElementById('clear-sort-btn');
  
  // Reset all buttons
  if (titleBtn) {
    titleBtn.classList.remove('active');
    const icon = titleBtn.querySelector('.sort-icon');
    if (icon) icon.textContent = '';
  }
  if (priceBtn) {
    priceBtn.classList.remove('active');
    const icon = priceBtn.querySelector('.sort-icon');
    if (icon) icon.textContent = '';
  }
  if (clearBtn) {
    clearBtn.style.opacity = sortField ? '1' : '0.5';
  }
  
  // Set active button and icon
  if (sortField === 'title' && titleBtn) {
    titleBtn.classList.add('active');
    const icon = titleBtn.querySelector('.sort-icon');
    if (icon) icon.textContent = sortOrder === 'asc' ? ' ↑' : ' ↓';
  }
  if (sortField === 'price' && priceBtn) {
    priceBtn.classList.add('active');
    const icon = priceBtn.querySelector('.sort-icon');
    if (icon) icon.textContent = sortOrder === 'asc' ? ' ↑' : ' ↓';
  }
}

function applySearch() {
  const input = document.getElementById('search-input');
  const q = (input?.value || '').trim().toLowerCase();
  if (!q) {
    filteredProducts = allProducts;
  } else {
    filteredProducts = allProducts.filter(p => (p.title || '').toLowerCase().includes(q));
  }
}

export async function getAll() {
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="8">Loading...</td></tr>';

  try {
    const res = await fetch('https://api.escuelajs.co/api/v1/products');
    if (!res.ok) throw new Error('Network response was not ok');
    const products = await res.json();
    allProducts = Array.isArray(products) ? products : [];
    filteredProducts = allProducts;
    currentPage = 1;
    renderProductsPage(filteredProducts, 1);
    setupSearch();
    setupSort();
    setupPagination();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8">Error loading products: ${err.message}</td></tr>`;
    console.error(err);
  }
}
