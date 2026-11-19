document.addEventListener('DOMContentLoaded', () => {
    const FORM_ENDPOINT = 'https://formcarry.com/s/FJ_8HEpSg3U'; 
    
    const modalOverlay = document.getElementById('modalOverlay');
    const openBtn = document.getElementById('openFormBtn');
    const closeBtn = document.getElementById('closeFormBtn');
    const form = document.getElementById('feedbackForm');
    const submitBtn = document.getElementById('submitBtn');
    const formMessage = document.getElementById('formMessage');
    
    const fields = {
        name: document.getElementById('name'),
        email: document.getElementById('email'),
        phone: document.getElementById('phone'),
        organization: document.getElementById('organization'),
        message: document.getElementById('message'),
        agreement: document.getElementById('agreement')
    };

    openBtn.addEventListener('click', () => {
        history.pushState({ modalOpen: true }, '', '#feedback-form');
        showModal();
    });

    closeBtn.addEventListener('click', () => {
        history.back();
    });

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            history.back();
        }
    });

    window.addEventListener('popstate', () => {
        if (modalOverlay.classList.contains('active')) {
            hideModal();
        }
        if (window.location.hash === '#feedback-form' && !modalOverlay.classList.contains('active')) {
            showModal();
        }
    });

    if (window.location.hash === '#feedback-form') {
        showModal();
    }

    function showModal() {
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        restoreFormData();
    }

    function hideModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
        clearMessage();
    }

    const STORAGE_KEY = 'feedback_form_data';

    function saveFormData() {
        const data = {
            name: fields.name.value,
            email: fields.email.value,
            phone: fields.phone.value,
            organization: fields.organization.value,
            message: fields.message.value,
            agreement: fields.agreement.checked
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function restoreFormData() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                fields.name.value = data.name || '';
                fields.email.value = data.email || '';
                fields.phone.value = data.phone || '';
                fields.organization.value = data.organization || '';
                fields.message.value = data.message || '';
                fields.agreement.checked = data.agreement || false;
            } catch (e) {
                console.error('Ошибка восстановления данных', e);
            }
        }
    }

    function clearFormData() {
        localStorage.removeItem(STORAGE_KEY);
    }

    Object.values(fields).forEach(field => {
        field.addEventListener('input', saveFormData);
        field.addEventListener('change', saveFormData);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearMessage();

        if (!form.checkValidity()) {
            const invalidField = form.querySelector(':invalid');
            if (invalidField) {
                invalidField.reportValidity();
                if (invalidField === fields.agreement) {
                    showMessage('Необходимо согласие на обработку персональных данных.', 'error');
                } else {
                    showMessage('Проверьте правильность заполнения полей.', 'error');
                }
                invalidField.focus();
            }
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';

        const formData = new FormData(form);

        try {
            const response = await fetch(FORM_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: formData
            });

            if (response.ok) {
                showMessage('Сообщение успешно отправлено!', 'success');
                form.reset();
                clearFormData();
                
                setTimeout(() => {
                    if (modalOverlay.classList.contains('active')) {
                        history.back();
                    }
                }, 2000);
            } else {
                throw new Error('Ошибка сервера');
            }
        } catch (error) {
            showMessage('Произошла ошибка при отправке. Попробуйте позже.', 'error');
            console.error(error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Отправить';
        }
    });

    function showMessage(text, type) {
        formMessage.textContent = text;
        formMessage.className = `message ${type}`;
    }

    function clearMessage() {
        formMessage.textContent = '';
        formMessage.className = 'message';
    }
});