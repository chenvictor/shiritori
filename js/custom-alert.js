const CustomAlert = new function() {

    let fallback = function() {
        function showMsg(msg) {
            alert(msg);
        }
        return showMsg;
    };

    let modalAlert = (_modal, _text) => {
        let modal = _modal;
        let text = _text;
        let isShowing = false;
        let queue = [];
        function showMsg(msg) {
            if (isShowing) {
                //Add message to queue
                queue.push(msg);
            } else {
                showModal(msg);
            }
        }
        function showModal(msg) {
            isShowing = true;
            text.innerHTML = msg;
            modal.modal('show');
        }
        function nextModal() {
            if (queue.length === 0) {
                isShowing = false;
            } else {
                showModal(queue.shift());
            }
        }
        modal.on('hidden.bs.modal', nextModal);
        return showMsg;
    };

    this.showMessage = () => {};    //Stub

    window.addEventListener('load', () => {
        let text = document.getElementById('alertModalMessage');
        let modal = $('#alertModal');
        if (modal === null || text === null) {
            console.warn("Alert modal not found!");
            this.showMessage = fallback();
        } else {
            this.showMessage = modalAlert(modal, text);
        }
    });

};