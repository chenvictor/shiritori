const CustomAlert = new function() {
    const modal = $('#alertModal');
    const text = document.getElementById('alertModalMessage');

    this.showMessage = function(message) {
        // Fallback method to use if no modal found
        console.debug("Displaying message: %s", message);
        alert(message);
    };
    if (modal === null || text === null) {
        console.warn("Alert modal not found!");
    } else {
        this.showMessage = function (message) {
            console.debug("Displaying message: %s", message);
            text.innerHTML = message;
            modal.modal('show');
        };
    }
};