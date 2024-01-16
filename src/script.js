document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const formData = {
            username: username,
            password: password
        };

        // Send the form data to the server
        fetch('http://127.0.0.1:5000/saveFormData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            window.location.reload();
        })
        .catch((error) => {
            console.error('Error:', error);
            // Handle error, for example, show an error message to the user
        });
    });
});
