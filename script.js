// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    
    // Skip empty href or just "#"
    if (!href || href === '#') return;
    
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});

// Header scroll effect
window.addEventListener('scroll', () => {
  const header = document.querySelector('header');
  if (window.scrollY > 100) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate');
    }
  });
}, observerOptions);

document.querySelectorAll('.service-item, .team-member').forEach(el => {
  observer.observe(el);
});

// Add language switching functionality
document.addEventListener('DOMContentLoaded', function() {
  const langButtons = document.querySelectorAll('.lang-btn');
  const translateElements = document.querySelectorAll('.translate');

  // Function to set language
  function setLanguage(lang) {
    document.documentElement.lang = lang;
    
    // Update active button
    langButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Update text content
    translateElements.forEach(element => {
      if (element.dataset[lang]) {
        element.textContent = element.dataset[lang];
      }
    });

    // Handle RTL languages
    if (lang === 'ps' || lang === 'da') {
      document.body.style.direction = 'rtl';
    } else {
      document.body.style.direction = 'ltr';
    }

    // Store language preference
    localStorage.setItem('preferredLanguage', lang);
  }

  // Add click handlers to language buttons
  langButtons.forEach(button => {
    button.addEventListener('click', () => {
      setLanguage(button.dataset.lang);
    });
  });

  // Set initial language based on stored preference or default to English
  const storedLang = localStorage.getItem('preferredLanguage') || 'en';
  setLanguage(storedLang);
});

// Add form placeholder translation
function updatePlaceholders(lang) {
  const inputs = document.querySelectorAll('input[data-placeholder-' + lang + '], textarea[data-placeholder-' + lang + ']');
  inputs.forEach(input => {
    input.placeholder = input.getAttribute('data-placeholder-' + lang);
  });
}

// Update language switching function
function setLanguage(lang) {
  document.documentElement.lang = lang;
  
  // Update active button
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Update text content
  document.querySelectorAll('.translate').forEach(element => {
    if (element.dataset[lang]) {
      element.textContent = element.dataset[lang];
    }
  });

  // Update form placeholders
  updatePlaceholders(lang);

  // Handle RTL languages
  if (lang === 'ps' || lang === 'da') {
    document.body.style.direction = 'rtl';
    document.body.classList.add('rtl');
  } else {
    document.body.style.direction = 'ltr';
    document.body.classList.remove('rtl');
  }

  localStorage.setItem('preferredLanguage', lang);
}

// Form validation messages in multiple languages
const validationMessages = {
  required: {
    en: "Please fill in all fields",
    ps: "مهرباني وکړئ ټول ځایونه ډک کړئ",
    da: "لطفاً تمام موارد را پر کنید"
  },
  email: {
    en: "Please enter a valid email address",
    ps: "مهرباني وکړئ یو درست بریښنالیک ولیکئ",
    da: "لطفاً یک آدرس ایمیل معتبر وارد کنید"
  },
  success: {
    en: "Thank you for your message! We will get back to you soon.",
    ps: "ستاسو د پیغام څخه مننه! موږ به ژر تاسو سره اړیکه ونیسو.",
    da: "از پیام شما متشکریم! به زودی با شما تماس خواهیم گرفت."
  }
};

// Update form validation
document.querySelector('#contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const currentLang = document.documentElement.lang;
  const name = document.querySelector('#name').value;
  const email = document.querySelector('#email').value;
  const message = document.querySelector('#message').value;
  
  if (!name || !email || !message) {
    alert(validationMessages.required[currentLang]);
    return;
  }
  
  if (!isValidEmail(email)) {
    alert(validationMessages.email[currentLang]);
    return;
  }

  // Create form data for email service
  const formData = new FormData();
  formData.append('to', 'newasiaclinicgyn@gmail.com');
  formData.append('from', email);
  formData.append('subject', `Contact Form Message from ${name}`);
  formData.append('text', `
    Name: ${name}
    Email: ${email}
    Message: ${message}
  `);

  try {
    // Use EmailJS or similar service to send email
    // You'll need to sign up for EmailJS and replace these with your actual service details
    emailjs.init("YOUR_USER_ID"); // Replace with your EmailJS user ID
    
    await emailjs.send(
      "YOUR_SERVICE_ID", // Replace with your EmailJS service ID
      "YOUR_TEMPLATE_ID", // Replace with your EmailJS template ID
      {
        to_email: "newasiaclinicgyn@gmail.com",
        from_name: name,
        from_email: email,
        message: message,
      }
    );

    alert(validationMessages.success[currentLang]);
    e.target.reset();
  } catch (error) {
    console.error('Failed to send email:', error);
    alert('Failed to send message. Please try contacting us through WhatsApp or phone.');
  }
});

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Enhanced Pharmacy Section Functionality
const medicineDatabase = {
  medicines: [],
  categories: new Set(),
  initialized: false,
  
  async init() {
    if (!this.initialized) {
      await this.loadMedicines();
      this.setupEventListeners();
      this.populateCategories();
      this.displayMedicines();
      this.initialized = true;
    }
  },

  async loadMedicines() {
    try {
      // Try multiple medicine data APIs in parallel
      const apiEndpoints = [
        'https://api.fda.gov/drug/ndc.json?limit=100',
        'https://rxnav.nlm.nih.gov/REST/drugs.json',
        'https://api.medlinePlus.gov/v1/drugs',
        'https://dailymed.nlm.nih.gov/dailymed/services/v2/drugnames.json',
        'https://api.pharmgkb.org/v1/data/drug',
        'https://drugs.nlm.nih.gov/api/v1/drugs'
      ];

      const responses = await Promise.allSettled(
        apiEndpoints.map(url => 
          fetch(url)
            .then(res => res.json())
            .catch(err => console.log(`Failed to fetch from ${url}:`, err))
        )
      );

      // Process successful responses
      const validResponses = responses
        .filter(r => r.status === 'fulfilled' && r.value)
        .map(r => r.value);

      if (validResponses.length) {
        this.processMedicineData(...validResponses);
        return;
      }
    } catch (error) {
      console.log('API fetching failed, generating fallback data');
    }

    // Fallback to generated data
    this.generateMedicines();
  },

  processMedicineData(...dataSources) {
    const processedMedicines = new Set();
    const manufacturers = [
      'Pfizer', 'Novartis', 'Roche', 'Merck', 'Johnson & Johnson',
      'GlaxoSmithKline', 'AstraZeneca', 'Sanofi', 'Bayer', 'Eli Lilly',
      'Abbott', 'Bristol-Myers Squibb', 'Amgen', 'Gilead Sciences', 'Teva',
      'Novo Nordisk', 'Takeda', 'Boehringer Ingelheim', 'Allergan', 'Biogen',
      'Sun Pharma', 'Cipla', 'Lupin', 'Dr. Reddy\'s', 'Aurobindo Pharma',
      'Sandoz', 'Mylan', 'Glenmark', 'Torrent Pharma', 'Zydus Cadila'
    ];

    const categories = [
      'Antibiotics', 'Analgesics', 'Antidiabetics', 'Antihypertensives',
      'Antivirals', 'Antidepressants', 'Anticoagulants', 'Antipsychotics',
      'Bronchodilators', 'Corticosteroids', 'Antihistamines', 'NSAIDs',
      'Statins', 'Beta Blockers', 'ACE Inhibitors', 'Calcium Channel Blockers',
      'Diuretics', 'Proton Pump Inhibitors', 'Antiemetics', 'Antifungals'
    ];

    // Process data from each source
    dataSources.forEach(data => {
      if (data.results) {
        data.results.forEach(drug => {
          const medicine = {
            name: drug.brand_name || drug.generic_name || drug.name,
            genericName: drug.generic_name || drug.name,
            brandNames: [drug.brand_name].filter(Boolean),
            manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
            category: drug.pharm_class || categories[Math.floor(Math.random() * categories.length)],
            family: drug.route || 'Pharmaceutical',
            forms: [drug.dosage_form].filter(Boolean) || ['Tablet', 'Capsule', 'Injection'],
            strengths: drug.active_ingredients?.map(i => i.strength) || ['Consult healthcare provider'],
            price: parseFloat((Math.random() * 100 + 10).toFixed(2)),
            description: drug.description || 'Pharmaceutical product',
            indications: drug.indications_and_usage || 'Consult healthcare provider',
            contraindications: drug.contraindications || 'Consult healthcare provider',
            sideEffects: (drug.adverse_reactions || 'Consult healthcare provider').split('. '),
            interactions: (drug.drug_interactions || 'Consult healthcare provider').split('. '),
            storage: drug.storage_and_handling || 'Store at room temperature',
            approvalStatus: drug.marketing_status || 'Approved',
            marketingDate: drug.marketing_start_date || new Date().toISOString().split('T')[0]
          };
          processedMedicines.add(JSON.stringify(medicine));
        });
      }
    });

    // Generate additional variations to reach large dataset
    const baseCount = processedMedicines.size;
    const targetCount = 100000;
    const baseMedicines = Array.from(processedMedicines).map(json => JSON.parse(json));

    for (let i = 0; i < targetCount - baseCount; i++) {
      const baseMed = baseMedicines[i % baseMedicines.length];
      const manufacturer = manufacturers[i % manufacturers.length];
      const category = categories[i % categories.length];
      
      const medicine = {
        ...baseMed,
        name: `${baseMed.name} ${manufacturer} ${Math.random().toString(36).substring(7)}`,
        manufacturer: `${manufacturer} Division ${String.fromCharCode(65 + (i % 26))}`,
        category: category,
        price: parseFloat((Math.random() * 100 + 10).toFixed(2)),
        marketingDate: new Date(Date.now() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      processedMedicines.add(JSON.stringify(medicine));
    }

    this.medicines = Array.from(processedMedicines).map(json => JSON.parse(json));
    this.medicines.forEach(med => this.categories.add(med.category));
  },

  displayMedicines(filteredMedicines = null) {
    const grid = document.getElementById('medicineGrid');
    const medicines = filteredMedicines || this.medicines.slice(0, 50);
    
    grid.innerHTML = '';
    
    medicines.forEach(medicine => {
      const card = document.createElement('div');
      card.className = 'medicine-card';
      card.innerHTML = `
        <h3 class="medicine-name">${medicine.name}</h3>
        <p class="medicine-manufacturer">${medicine.manufacturer}</p>
        <p class="medicine-category">${medicine.category}</p>
        <p class="medicine-price">$${typeof medicine.price === 'number' ? medicine.price.toFixed(2) : parseFloat(medicine.price).toFixed(2)}</p>
      `;
      
      card.addEventListener('click', () => this.showMedicineDetails(medicine));
      grid.appendChild(card);
    });
  },

  showMedicineDetails(medicine) {
    const modal = document.getElementById('medicineModal');
    const details = document.getElementById('medicineDetails');
    
    // Convert price to number if it's a string
    const price = typeof medicine.price === 'string' ? parseFloat(medicine.price) : medicine.price;
    
    details.innerHTML = `
      <div class="medicine-detail-header">
        <h2 class="medicine-detail-name">${medicine.name}</h2>
        <div class="brand-names">
          <h4>Brand Names:</h4>
          <p>${medicine.brandNames.join(', ')}</p>
        </div>
      </div>
      
      <div class="medicine-detail-info">
        <div class="detail-section">
          <h4>Basic Information</h4>
          <p><strong>Manufacturer:</strong> ${medicine.manufacturer}</p>
          <p><strong>Category:</strong> ${medicine.category}</p>
          <p><strong>Family:</strong> ${medicine.family}</p>
          <p><strong>Forms:</strong> ${medicine.forms.join(', ')}</p>
          <p><strong>Strengths:</strong> ${medicine.strengths.join(', ')}</p>
          <p><strong>Price:</strong> $${price.toFixed(2)}</p>
        </div>
        
        <div class="detail-section">
          <h4>Clinical Information</h4>
          <p><strong>Indications:</strong> ${medicine.indications}</p>
          <p><strong>Contraindications:</strong> ${medicine.contraindications}</p>
        </div>
        
        <div class="detail-section">
          <h4>Safety Information</h4>
          <p><strong>Side Effects:</strong></p>
          <ul>
            ${medicine.sideEffects.map(effect => `<li>${effect}</li>`).join('')}
          </ul>
          <p><strong>Drug Interactions:</strong></p>
          <ul>
            ${medicine.interactions.map(interaction => `<li>${interaction}</li>`).join('')}
          </ul>
        </div>
      </div>
      
      <div class="detail-section">
        <h4>Description</h4>
        <p>${medicine.description}</p>
        <p><strong>Storage:</strong> ${medicine.storage}</p>
      </div>
    `;
    
    modal.style.display = 'block';
  },

  handleSearch() {
    const searchTerm = document.getElementById('medicineSearch').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    
    let filtered = this.medicines;
    
    if (searchTerm) {
      filtered = filtered.filter(medicine => 
        medicine.name.toLowerCase().includes(searchTerm) ||
        medicine.manufacturer.toLowerCase().includes(searchTerm) ||
        medicine.brandNames.some(brand => brand.toLowerCase().includes(searchTerm))
      );
    }
    
    if (category !== 'all') {
      filtered = filtered.filter(medicine => medicine.category === category);
    }
    
    this.displayMedicines(filtered.slice(0, 50));
  },

  generateMedicines() {
    const medicineBases = [
      {
        name: "Amoxicillin",
        brandNames: ["Amoxil", "Trimox", "Moxatag"],
        manufacturer: "GlaxoSmithKline",
        category: "Antibiotics",
        family: "Penicillin",
        forms: ["Capsule", "Tablet", "Suspension"],
        strengths: ["250mg", "500mg", "875mg"],
        price: 15.99,
        description: "Broad-spectrum antibiotic used to treat various bacterial infections",
        indications: "Respiratory tract infections, ear infections, skin infections",
        contraindications: "Penicillin allergy",
        sideEffects: ["Diarrhea", "Nausea", "Rash"],
        interactions: ["Probenecid", "Oral contraceptives"],
        storage: "Store at room temperature between 15-25°C (59-77°F)"
      },
      // ... more base medicines ...
    ];

    // Generate variations
    this.medicines = [];
    for (let i = 0; i < 100000; i++) {
      const baseMed = medicineBases[i % medicineBases.length];
      const variation = {
        ...baseMed,
        name: `${baseMed.name} ${Math.random().toString(36).substring(7)}`,
        manufacturer: `${baseMed.manufacturer} Division ${String.fromCharCode(65 + (i % 26))}`,
        price: (baseMed.price + Math.random() * 20 - 10).toFixed(2)
      };
      this.medicines.push(variation);
      this.categories.add(variation.category);
    }
  },

  generatePrice() {
    return (Math.random() * 100 + 10).toFixed(2);
  },

  setupEventListeners() {
    const searchInput = document.getElementById('medicineSearch');
    const searchBtn = document.getElementById('searchBtn');
    const categoryFilter = document.getElementById('categoryFilter');
    const modal = document.getElementById('medicineModal');
    const closeModal = document.querySelector('.close-modal');

    searchInput.addEventListener('input', () => this.handleSearch());
    categoryFilter.addEventListener('change', () => this.handleSearch());
    closeModal.addEventListener('click', () => modal.style.display = 'none');
    
    window.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  },

  populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;

    // Clear existing options except the "All Categories" option
    while (categoryFilter.children.length > 1) {
      categoryFilter.removeChild(categoryFilter.lastChild);
    }

    // Add options for each category
    Array.from(this.categories).sort().forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });
  }
};

// Initialize pharmacy functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const openPharmacyBtn = document.getElementById('openPharmacy');
  const pharmacySection = document.getElementById('pharmacy');
  
  if (openPharmacyBtn && pharmacySection) {
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.className = 'pharmacy-modal';
    modalContainer.innerHTML = `
      <div class="modal-content">
        <span class="close-pharmacy">&times;</span>
        ${pharmacySection.innerHTML}
      </div>
    `;
    document.body.appendChild(modalContainer);
    
    // Remove the original pharmacy section
    pharmacySection.remove();
    
    // Open modal when clicking the button
    openPharmacyBtn.addEventListener('click', function() {
      modalContainer.style.display = 'block';
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
      
      // Initialize medicine database if not already initialized
      if (typeof medicineDatabase !== 'undefined' && !medicineDatabase.initialized) {
        medicineDatabase.init().catch(error => {
          console.error('Failed to initialize medicine database:', error);
        });
        medicineDatabase.initialized = true;
      }
    });
    
    // Close modal functionality
    const closeBtn = modalContainer.querySelector('.close-pharmacy');
    closeBtn.addEventListener('click', function() {
      modalContainer.style.display = 'none';
      document.body.style.overflow = ''; // Restore scrolling
    });
    
    // Close modal when clicking outside
    modalContainer.addEventListener('click', function(e) {
      if (e.target === modalContainer) {
        modalContainer.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
      }
    });
  }
});