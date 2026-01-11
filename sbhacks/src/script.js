document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('playerForm');
    const successMessage = document.getElementById('successMessage');
    const submittedData = document.getElementById('submittedData');
    
    // Function to extract character name from value (e.g., "Berta: Middle-aged black lady" -> "Berta")
    function getCharacterName(value) {
        if (!value) return null;
        const colonIndex = value.indexOf(':');
        return colonIndex > 0 ? value.substring(0, colonIndex).trim() : value.trim();
    }
    
    // Function to find radio button with matching character name
    function findRadioByCharacterName(radios, characterName) {
        for (let radio of radios) {
            if (getCharacterName(radio.value) === characterName) {
                return radio;
            }
        }
        return null;
    }
    
    // Function to update disabled states based on selections
    function updateDisabledStates() {
        const playerSelected = document.querySelector('input[name="option1"]:checked');
        const opponentSelected = document.querySelector('input[name="option2"]:checked');
        
        // Get all radio buttons
        const playerRadios = document.querySelectorAll('input[name="option1"]');
        const opponentRadios = document.querySelectorAll('input[name="option2"]');
        
        // First, enable all radio buttons
        playerRadios.forEach(radio => radio.disabled = false);
        opponentRadios.forEach(radio => radio.disabled = false);
        
        // If player has selected an avatar, disable the corresponding opponent option
        if (playerSelected) {
            const playerCharacterName = getCharacterName(playerSelected.value);
            const matchingOpponentRadio = findRadioByCharacterName(opponentRadios, playerCharacterName);
            if (matchingOpponentRadio) {
                if (matchingOpponentRadio.checked) {
                    // If the corresponding option is currently selected, uncheck it
                    matchingOpponentRadio.checked = false;
                }
                matchingOpponentRadio.disabled = true;
            }
        }
        
        // If opponent has been selected, disable the corresponding player option
        if (opponentSelected) {
            const opponentCharacterName = getCharacterName(opponentSelected.value);
            const matchingPlayerRadio = findRadioByCharacterName(playerRadios, opponentCharacterName);
            if (matchingPlayerRadio) {
                if (matchingPlayerRadio.checked) {
                    // If the corresponding option is currently selected, uncheck it
                    matchingPlayerRadio.checked = false;
                }
                matchingPlayerRadio.disabled = true;
            }
        }
    }
    
    // Add event listeners to both avatar radio groups
    const playerRadios = document.querySelectorAll('input[name="option1"]');
    const opponentRadios = document.querySelectorAll('input[name="option2"]');
    
    playerRadios.forEach(radio => {
        radio.addEventListener('change', updateDisabledStates);
    });
    
    opponentRadios.forEach(radio => {
        radio.addEventListener('change', updateDisabledStates);
    });
    
    // Initial update
    updateDisabledStates();
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const playerName = document.getElementById('playerName').value.trim();
        const playerEmail = document.getElementById('playerEmail').value.trim();
        
        // Get selected radio button values
        const option1 = document.querySelector('input[name="option1"]:checked');
        const option2 = document.querySelector('input[name="option2"]:checked');
        const option3 = document.querySelector('input[name="option3"]:checked');
        
        // Validate all fields are filled
        if (!playerName || !playerEmail || !option1 || !option2 || !option3) {
            alert('Please fill in all fields and select an option from each set.');
            return;
        }
        
        // Validate that player and opponent are different
        const playerCharacterName = getCharacterName(option1.value);
        const opponentCharacterName = getCharacterName(option2.value);
        if (playerCharacterName === opponentCharacterName) {
            alert('You cannot select the same character for both player and opponent. Please choose different characters.');
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(playerEmail)) {
            alert('Please enter a valid email address.');
            return;
        }
        
        // Prepare data object
        const formData = {
            playerName: playerName,
            playerEmail: playerEmail,
            option1: option1.value,
            option2: option2.value,
            option3: option3.value
        };
        
        // Get character names
        const playerCharacter = getCharacterName(option1.value);
        const opponentCharacter = getCharacterName(option2.value);
        
        // Redirect to courtroom page with avatar selections as URL parameters
        window.location.href = `courtroom.html?player=${encodeURIComponent(playerCharacter)}&opponent=${encodeURIComponent(opponentCharacter)}`;
        
        // Log to console (you can replace this with actual API call)
        console.log('Form submitted with data:', formData);
    });
    
    // Add real-time validation feedback
    const nameInput = document.getElementById('playerName');
    const emailInput = document.getElementById('playerEmail');
    
    nameInput.addEventListener('blur', function() {
        if (this.value.trim() === '') {
            this.style.borderColor = '#dc3545';
        } else {
            this.style.borderColor = '#e0e0e0';
        }
    });
    
    emailInput.addEventListener('blur', function() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (this.value.trim() === '' || !emailRegex.test(this.value)) {
            this.style.borderColor = '#dc3545';
        } else {
            this.style.borderColor = '#e0e0e0';
        }
    });
    
    // Reset border color on input
    nameInput.addEventListener('input', function() {
        this.style.borderColor = '#e0e0e0';
    });
    
    emailInput.addEventListener('input', function() {
        this.style.borderColor = '#e0e0e0';
    });
});
