const CustomAlert = new function() {
    const modal = $('#alertModal');
    const text = document.getElementById('alertModalMessage');


    this.showMessage = function(message) {
        alert(message);
    };
    if (modal === null || text === null) {
        console.warn("Alert modal not found!");
    } else {
        this.showMessage = function (message) {
            text.innerHTML = message;
            modal.modal('show');
        };
    }
};