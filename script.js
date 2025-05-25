document.addEventListener('DOMContentLoaded', function () {
	// DOM Elements
	const inputText = document.getElementById('input-text');
	const outputText = document.getElementById('output-text');
	const copyBtn = document.getElementById('copy-btn');
	const clearBtn = document.getElementById('clear-btn');
	const shareBtn = document.getElementById('share-btn');
	const toast = document.getElementById('toast');
	const currentYear = document.getElementById('current-year');
	const inputCount = document.getElementById('input-count');
	const outputCount = document.getElementById('output-count');
	const slugPreview = document.getElementById('slug-preview');

	// Option elements
	const lowercaseCheckbox = document.getElementById('lowercase');
	const trimCheckbox = document.getElementById('trim');
	const removeSpecialCheckbox = document.getElementById('remove-special');
	const dashSeparatorRadio = document.getElementById('dash-separator');
	const underscoreSeparatorRadio = document.getElementById('underscore-separator');
	const noneSeparatorRadio = document.getElementById('none-separator');
	const removeStopwordsCheckbox = document.getElementById('remove-stopwords');
	const removeNumbersCheckbox = document.getElementById('remove-numbers');
	const preserveCaseCheckbox = document.getElementById('preserve-case');
	const smartQuotesCheckbox = document.getElementById('smart-quotes');
	const removeAccentsCheckbox = document.getElementById('remove-accents');

	// Common stop words
	const stopWords = new Set([
		'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else', 'when',
		'at', 'by', 'for', 'from', 'in', 'into', 'of', 'on', 'to', 'with',
		'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
		'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
		'can', 'could', 'may', 'might', 'must', 'shall', 'ought'
	]);

	// Smart quotes mapping
	const smartQuotesMap = {
		'\u2018': "'", '\u2019': "'", '\u201C': '"', '\u201D': '"',
		'\u2032': "'", '\u2033': '"'
	};

	// Accent characters mapping
	const accentsMap = {
		'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
		'à': 'a', 'è': 'e', 'ì': 'i', 'ò': 'o', 'ù': 'u',
		'ä': 'a', 'ë': 'e', 'ï': 'i', 'ö': 'o', 'ü': 'u',
		'â': 'a', 'ê': 'e', 'î': 'i', 'ô': 'o', 'û': 'u',
		'ã': 'a', 'ñ': 'n', 'õ': 'o', 'ç': 'c',
		'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U',
		'À': 'A', 'È': 'E', 'Ì': 'I', 'Ò': 'O', 'Ù': 'U',
		'Ä': 'A', 'Ë': 'E', 'Ï': 'I', 'Ö': 'O', 'Ü': 'U',
		'Â': 'A', 'Ê': 'E', 'Î': 'I', 'Ô': 'O', 'Û': 'U',
		'Ã': 'A', 'Ñ': 'N', 'Õ': 'O', 'Ç': 'C'
	};

	// Set current year in footer
	currentYear.textContent = new Date().getFullYear();

	// Initialize character count
	function updateCharacterCount() {
		const inputLength = inputText.value.length;
		inputCount.textContent = `${inputLength} character${inputLength !== 1 ? 's' : ''}`;

		const outputLength = outputText.value.length;
		outputCount.textContent = `${outputLength} character${outputLength !== 1 ? 's' : ''}`;
	}

	// Show toast notification
	function showToast(message) {
		toast.textContent = message;
		toast.classList.add('show');

		setTimeout(() => {
			toast.classList.remove('show');
		}, 3000);
	}

	// Copy text to clipboard
	function copyToClipboard(text) {
		if (!text) {
			showToast('Nothing to copy!');
			return;
		}

		navigator.clipboard.writeText(text).then(() => {
			showToast('Copied to clipboard!');
		}).catch(err => {
			console.error('Failed to copy: ', err);
			showToast('Failed to copy!');
		});
	}

	// Generate slug from input text
	function generateSlug() {
		let text = inputText.value;

		// Update character count
		updateCharacterCount();

		if (!text.trim()) {
			outputText.value = '';
			slugPreview.textContent = 'your-slug-will-appear-here';
			return;
		}

		// Apply transformations based on selected options
		if (trimCheckbox.checked) {
			text = text.trim();
		}

		if (smartQuotesCheckbox.checked) {
			text = text.replace(/[\u2018\u2019\u201C\u201D\u2032\u2033]/g, function (match) {
				return smartQuotesMap[match];
			});
		}

		if (removeAccentsCheckbox.checked) {
			text = text.replace(/[áéíóúàèìòùäëïöüâêîôûãñõçÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÂÊÎÔÛÃÑÕÇ]/g, function (match) {
				return accentsMap[match];
			});
		}

		if (removeSpecialCheckbox.checked) {
			// Replace special characters with space, except allowed ones
			text = text.replace(/[^\w\s-']/g, ' ');
		}

		if (removeStopwordsCheckbox.checked) {
			text = text.split(/\s+/).filter(word => {
				const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
				return !stopWords.has(cleanWord);
			}).join(' ');
		}

		if (removeNumbersCheckbox.checked) {
			text = text.replace(/[0-9]/g, '');
		}

		// Handle camelCase preservation
		if (preserveCaseCheckbox.checked && !lowercaseCheckbox.checked) {
			// Add space before capital letters to separate words
			text = text.replace(/([a-z])([A-Z])/g, '$1 $2');
		}

		// Replace whitespace with selected separator
		let separator = '-';
		if (underscoreSeparatorRadio.checked) {
			separator = '_';
		} else if (noneSeparatorRadio.checked) {
			separator = '';
		}

		text = text.trim().replace(/\s+/g, separator);

		// Remove duplicate separators
		if (separator) {
			text = text.replace(new RegExp(`${separator}+`, 'g'), separator);
		}

		// Remove leading/trailing separators
		if (separator) {
			text = text.replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), '');
		}

		// Convert to lowercase if needed
		if (lowercaseCheckbox.checked && !preserveCaseCheckbox.checked) {
			text = text.toLowerCase();
		}

		outputText.value = text;
		slugPreview.textContent = text || 'your-slug-will-appear-here';
	}

	// Event listeners
	inputText.addEventListener('input', generateSlug);
	copyBtn.addEventListener('click', () => copyToClipboard(outputText.value));
	clearBtn.addEventListener('click', () => {
		inputText.value = '';
		generateSlug();
		inputText.focus();
	});

	// Share button functionality (placeholder)
	shareBtn.addEventListener('click', (e) => {
		e.preventDefault();
		showToast('Share functionality coming soon!');
	});

	// Options change listeners
	const optionElements = [
		lowercaseCheckbox, trimCheckbox, removeSpecialCheckbox,
		dashSeparatorRadio, underscoreSeparatorRadio, noneSeparatorRadio,
		removeStopwordsCheckbox, removeNumbersCheckbox, preserveCaseCheckbox,
		smartQuotesCheckbox, removeAccentsCheckbox
	];

	optionElements.forEach(element => {
		element.addEventListener('change', generateSlug);
	});

	// Initialize
	generateSlug();

	// Mobile menu toggle
	const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
	const mainNav = document.querySelector('.main-nav');

	if (mobileMenuBtn && mainNav) {
		mobileMenuBtn.addEventListener('click', () => {
			mainNav.style.display = mainNav.style.display === 'flex' ? 'none' : 'flex';
		});
	}

	// Smooth scrolling for anchor links
	document.querySelectorAll('a[href^="#"]').forEach(anchor => {
		anchor.addEventListener('click', function (e) {
			e.preventDefault();

			const targetId = this.getAttribute('href');
			if (targetId === '#') return;

			const targetElement = document.querySelector(targetId);
			if (targetElement) {
				targetElement.scrollIntoView({
					behavior: 'smooth'
				});

				// Close mobile menu if open
				if (mainNav && window.getComputedStyle(mainNav).display === 'flex') {
					mainNav.style.display = 'none';
				}
			}
		});
	});

	// Highlight active documentation section
	const docSections = document.querySelectorAll('.doc-article');
	const menuItems = document.querySelectorAll('.menu-item');

	function highlightActiveSection() {
		let currentSection = '';

		docSections.forEach(section => {
			const sectionTop = section.offsetTop - 100;
			if (window.scrollY >= sectionTop) {
				currentSection = '#' + section.getAttribute('id');
			}
		});

		menuItems.forEach(item => {
			item.classList.remove('active');
			if (item.getAttribute('href') === currentSection) {
				item.classList.add('active');
			}
		});
	}

	window.addEventListener('scroll', highlightActiveSection);
	highlightActiveSection(); // Initial call
});