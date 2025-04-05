document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('paymentForm');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const successModal = document.getElementById('successModal');
    const errorModal = document.getElementById('errorModal');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');

    // Format amount input with thousand separator
    const amountInput = document.getElementById('amount');
    amountInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value === '') return;
        
        // Format with thousand separator
        const formattedValue = new Intl.NumberFormat('id-ID').format(value);
        const cursorPosition = e.target.selectionStart;
        const difference = formattedValue.length - e.target.value.length;
        
        e.target.value = formattedValue;
        
        // Maintain cursor position
        if (cursorPosition + difference > 0) {
            e.target.setSelectionRange(cursorPosition + difference, cursorPosition + difference);
        }
    });

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Show loading overlay
        loadingOverlay.classList.remove('hidden');

        // Get form data
        const formData = {
            customerName: document.getElementById('customerName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            amount: document.getElementById('amount').value.replace(/\D/g, ''),
            paymentMethod: document.getElementById('paymentMethod').value
        };

        try {
            // Validate amount first
            const validateResponse = await fetch('/api/payment/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: formData.amount,
                    paymentMethod: formData.paymentMethod
                })
            });

            const validateData = await validateResponse.json();

            if (!validateData.data.isValid) {
                throw new Error('Invalid amount or payment method');
            }

            // Process payment
            const response = await fetch('/api/payment/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.status === 'success') {
                // Show success modal
                successMessage.innerHTML = `
                    Transaction ID: ${data.data.transactionId}<br>
                    Amount: Rp ${new Intl.NumberFormat('id-ID').format(data.data.amount)}<br>
                    Payment Method: ${data.data.paymentMethod}<br>
                    Status: ${data.data.paymentStatus}
                `;
                loadingOverlay.classList.add('hidden');
                successModal.classList.remove('hidden');
                form.reset();
            } else {
                throw new Error(data.message || 'Payment failed');
            }
        } catch (error) {
            // Show error modal
            errorMessage.textContent = error.message || 'An error occurred while processing your payment';
            loadingOverlay.classList.add('hidden');
            errorModal.classList.remove('hidden');
        }
    });

    // Function to check payment status
    async function checkPaymentStatus(transactionId) {
        try {
            const response = await fetch(`/api/payment/status/${transactionId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error checking payment status:', error);
            return null;
        }
    }

    // Modal control functions
    window.hideSuccessModal = function() {
        successModal.classList.add('hidden');
    };

    window.hideErrorModal = function() {
        errorModal.classList.add('hidden');
    };

    // Form validation
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('invalid', function(e) {
            e.preventDefault();
            input.classList.add('border-red-500');
        });

        input.addEventListener('input', function() {
            input.classList.remove('border-red-500');
        });
    });

    // Payment method selection styling
    const paymentMethod = document.getElementById('paymentMethod');
    paymentMethod.addEventListener('change', function() {
        const icons = document.querySelectorAll('.payment-icon');
        icons.forEach(icon => {
            icon.classList.remove('text-indigo-600');
            icon.classList.add('text-gray-600');
        });

        if (this.value) {
            const selectedIcon = document.querySelector(`.payment-icon[data-method="${this.value}"]`);
            if (selectedIcon) {
                selectedIcon.classList.remove('text-gray-600');
                selectedIcon.classList.add('text-indigo-600');
            }
        }
    });

    // Initialize tooltips
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseenter', function() {
            const tooltipText = this.getAttribute('data-tooltip');
            const tooltipEl = document.createElement('div');
            tooltipEl.className = 'absolute bg-gray-800 text-white text-sm rounded px-2 py-1 -mt-8';
            tooltipEl.textContent = tooltipText;
            this.appendChild(tooltipEl);
        });

        tooltip.addEventListener('mouseleave', function() {
            const tooltipEl = this.querySelector('.bg-gray-800');
            if (tooltipEl) {
                tooltipEl.remove();
            }
        });
    });
});